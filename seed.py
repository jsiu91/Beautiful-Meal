from app import app
from models import db, User

#Initializing database
db.drop_all()
db.create_all()

#Creating a few users for 
user1 = User.register(
    username='admin',
    password='adminj',
    email='jsiukob@gmail.com',
    name='Jonathan Siu',
    height='511',
    weight='160'
)

user2 = User.register(
    username='guest',
    password='guests',
    email='guest@mail.com',
    name='Eric Wong',
    height='590',
    weight='140'
)

db.session.add_all([user1, user2])
db.session.commit()