#Custom WTForm Fields 
from wtforms.validators import TextInput

class WeightField(Field):
    """Edit field data to return XXX lbs"""
    weight = TextInput()



