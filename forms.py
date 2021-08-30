from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, IntegerField
from wtforms.validators import DataRequired, Email, Length, NumberRange

class MessageForm(FlaskForm):
    """Form for adding/editing messages."""

    text = TextAreaField('text', validators=[DataRequired()])

class UserAddForm(FlaskForm):
    """Form for adding users."""

    username = StringField('Username', validators=[DataRequired()])
    name = StringField('Name', validators=[DataRequired(), Length(max=50)])
    email = StringField('E-mail', validators=[DataRequired(), Email()])
    weight = StringField('Weight', validators=[DataRequired(), Length(min=2, max=3)])
    height = StringField('Height', validators=[DataRequired(), Length(min=3, max=3)])
    password = PasswordField('Password', validators=[Length(min=6)])
    
class LoginForm(FlaskForm):
    """Login form."""

    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[Length(min=6)])

class UserEditForm(FlaskForm):
    """Edit Form."""

    username = StringField('Username', validators=[DataRequired()])
    name = StringField('Name', validators=[DataRequired(), Length(max=50)])
    email = StringField('E-mail', validators=[DataRequired(), Email()])
    weight = StringField('Weight', validators=[DataRequired(), Length(min=2, max=3)])
    height = StringField('Height', validators=[DataRequired(), Length(min=3, max=3)])
    password = PasswordField('Password', validators=[Length(min=6)])

class PlanAddForm(FlaskForm):
    """Plan form."""

    name = StringField('Name', validators=[DataRequired()])
    goal = IntegerField('Goal', validators=[DataRequired(), NumberRange(min=0)])

class RecipeAddForm(FlaskForm):
    """Recipe form."""

    name = StringField('Name', validators=[DataRequired()])
