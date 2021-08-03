"""SQLAlchemy models for Beautiful Meal."""
# https://dbdiagram.io/d/60b90bc0b29a09603d17dc6b

from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

bcrypt = Bcrypt()
db = SQLAlchemy()

def connect_db(app):
    """Connect this database to provided Flask app.
    You should call this in your Flask app.
    """

    db.app = app
    db.init_app(app)


class User(db.Model):
    """User model."""

    __tablename__ = 'users'

    username = db.Column(db.Text, primary_key=True, unique=True)

    password = db.Column(db.Text, nullable=False)

    name = db.Column(db.Text, nullable=False)

    email = db.Column(db.Text, nullable=False)

    weight = db.Column(db.Integer, nullable=False)

    height = db.Column(db.Integer, nullable=False)

    plans = db.relationship('Plan', backref='users', cascade='all, delete')

    daily = db.relationship('Daily', backref='users', cascade='all, delete')

    @classmethod
    def register(cls, username, password, email, name, weight, height):
        """Register user w/hashed password & return user."""
        
        hashed = bcrypt.generate_password_hash(password)

        hashed_utf8 = hashed.decode("utf8")

        return cls(username=username, password=hashed_utf8, email=email, 
        name=name, weight=weight, height=height)

    @classmethod
    def authenticate(cls, username, password):
        """Validate that user exists & password is correct.

        Return user if valid; else return False.
        """
        
        user = User.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password, password):
            return user
        else:
            return False

class Plan(db.Model):
    """Plan model."""

    __tablename__ = 'plans'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.Text, nullable=False)

    calories = db.Column(db.Integer, nullable=False)

    user = db.Column(db.Text, db.ForeignKey('users.username'))


class Daily(db.Model):
    """Daily model."""

    __tablename__ = 'dailies'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    day = db.Column(db.Integer, nullable=False)

    month = db.Column(db.Integer, nullable=False)

    calories = db.Column(db.Integer, nullable=False)

    goal = db.Column(db.Integer, nullable=False)

    user = db.Column(db.Text, db.ForeignKey('users.username'))

    breakfast = db.relationship('Breakfast')

    lunch = db.relationship('Lunch')

    dinner = db.relationship('Dinner')

class Breakfast(db.Model):
    """Breakfast model."""

    __tablename__ = 'breakfasts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.Integer, nullable=False)

    calories = db.Column(db.Integer, nullable=False)

    daily_id = db.Column(db.Integer, db.ForeignKey('dailies.id'))

class Lunch(db.Model):
    """Lunch model."""

    __tablename__ = 'lunches'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.Integer, nullable=False)

    calories = db.Column(db.Integer, nullable=False)

    daily_id = db.Column(db.Integer, db.ForeignKey('dailies.id'))

class Dinner(db.Model):
    """Breakfast model."""

    __tablename__ = 'dinner'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.Integer, nullable=False)

    calories = db.Column(db.Integer, nullable=False)

    daily_id = db.Column(db.Integer, db.ForeignKey('dailies.id'))