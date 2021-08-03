from flask import Flask, render_template, request, flash, redirect, session, g
from models import db, connect_db, User, Plan, Daily, Breakfast, Lunch, Dinner
from forms import UserAddForm, LoginForm, UserEditForm
from sqlalchemy.exc import IntegrityError
from flask_cors import cross_origin

import os
from datetime import datetime   

CURR_USER_KEY = "curr_user"

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', 'postgresql:///beautiful-meal'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "shhhh it's a secret")

connect_db(app)
db.create_all()

##############################################################################
# Add/Remove user to session functions:

@app.before_request
def add_user_to_g():
    """If we're logged in, add curr user to Flask global."""

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])

    else:
        g.user = None


def do_login(user):
    """Log in user."""

    session[CURR_USER_KEY] = user.username


def do_logout():
    """Logout user."""

    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]

##############################################################################
# General routes (Sign-in/Log-in/Log-out):

@app.route("/")
def homepage():
    """Show homepage if logged user or Show home-anon if no user."""
    if g.user:
        return render_template('home.html')
    else:
        return render_template('home-anon.html')

@app.route("/signup" , methods=['GET','POST'])
def signup():
    """Show signup form and handle registration process."""

    form = UserAddForm()

    if form.validate_on_submit():
        try:
            user = User.register(
                username=form.username.data,
                password=form.password.data,
                email=form.email.data,
                name=form.name.data,
                height=form.height.data,
                weight=form.weight.data
            )
            db.session.add(user)
            db.session.commit()

        except IntegrityError:
            flash("Username already taken", 'danger')
            return render_template('users/signup.html', form=form)

        do_login(user)

        return redirect("/")

    else:
        return render_template('users/signup.html', form=form)

@app.route('/login', methods=["GET", "POST"])
def login():
    """Show login form and handle user login."""

    form = LoginForm()

    if form.validate_on_submit():
        user = User.authenticate(form.username.data,
                                 form.password.data)

        if user:
            do_login(user)
            flash(f"Hello, {user.name}!", "success")
            return redirect("/")

        flash("Invalid credentials.", 'danger')

    return render_template('users/login.html', form=form)

@app.route('/logout')
def logout():
    """Handle logout of user."""

    do_logout()
    flash(f"You have successfully logout!", "success")
    return redirect('/login')

##############################################################################
# Users CRUD routes:

@app.route('/users/<username>', methods=['GET'])
def show_user(username):
    """Show users information."""

    if "curr_user" not in session:
        flash("You must be logged in to view!", "danger")
        return redirect('/login')
    else:
        user = User.query.filter_by(username=username).first()
        return render_template('users/user.html',user=user)

@app.route('/users/edit/<username>', methods=['GET','POST'])
def edit_user(username):
    """Show edit users form and update the changes."""

    print(g.user)

    if not g.user:
        flash("Access unauthorized.","danger")
        return redirect("/")

    user = User.query.get_or_404(username)
    form = UserEditForm(obj=user)

    if form.validate_on_submit():
        # Validate password
        user = User.authenticate(g.user.username,
                                 form.password.data)

        if user:
            user.username = form.username.data
            user.name = form.name.data
            user.email = form.email.data
            user.weight = form.weight.data
            user.height = form.height.data

            db.session.commit()
            flash("User successfully updated.", "success")
            return redirect("/")
        else:
            flash("Incorrect Password. Enter the correct password to update", "danger")
            return redirect(f"/users/edit/{username}")

    return render_template("/users/edit.html", form=form)

@app.route('/users/<username>/delete', methods=['POST'])
def delete_user(username):
    """Handle users deletion."""

    user = User.query.get_or_404(username)

    if "curr_user" not in session or session["curr_user"] != user.username:
        flash("You must be logged in to delete!", "danger")
        return redirect(f'/users/{user.username}')

    else:
        db.session.delete(user)
        db.session.commit()

        do_logout()

        flash(f"User {user.username} has been deleted")
        return redirect('/')

##############################################################################
# Users Daily/Plan routes:
@app.route('/users/add_breakfast', methods=['POST'])
@cross_origin() # Enable Access-Control-Allow-Origin
def add_breakfast_to_user():
    """Adding breakfast to daily."""
    print("HELLO")
    print (g)
    print(g.user)
    # print(g.user.username)

    user = User.query.get_or_404(username)
   
    day = datetime.now().day
    month = datetime.now().month

    data = request.get_json(silent=True)
    name = data["name"]
    calories = int(data["calories"])

    print(day)
    print(month)
    print(data)
    print(name)
    print(calories)

    daily = Daily(day=day, month=month , calories=0, goal=2000, user=g.user.username)

    meal = Breakfast(name=name,calories=calories,daily_id=daily.id)

    return redirect(f'/users/{g.user.username}')