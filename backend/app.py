from flask import Flask, jsonify,request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import sqlalchemy as sa
import sqlalchemy.orm as so
from sqlalchemy.orm import Mapped, mapped_column
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Use DATABASE_URL from the environment, fallback to local development URI
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL', 'sqlite:///users.db'
)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

CORS(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class CheckListData(db.Model):
    id : Mapped[int] = so.mapped_column(primary_key=True)
    summary : Mapped[str] = so.mapped_column()
    
    def todict(self):
        return {
            "summary" : self.summary
        }
    def __repr__(self):
        return f"{self.summary}"
class CheckListStates(db.Model):
    id : Mapped[int] = so.mapped_column(primary_key=True)
    statelocation : Mapped[str] = so.mapped_column(unique=True)
    state : Mapped[bool] = so.mapped_column()
    def todict(self):
        return {
            "location" : self.statelocation,
            "state" : self.state
        }
    def __repr__(self):
        return f"{self.statelocation}, {self.state}"
@app.route("/")
def start():
    return jsonify("Works")
@app.route("/checklistdata", methods=["POST"])
def checklistdata():
    data = request.get_json()
    u = CheckListData(summary=data["summary"])
    db.session.add(u)
    db.session.commit()
    return jsonify("Works")
@app.route("/returnchecklistdata", methods=["GET"])
def returnchecklistdata():
    returndata = [item.todict() for item in CheckListData.query.all()]
    return returndata
@app.route("/checkliststatesadd", methods=["POST"]) 
def checkliststatesadd():
    data = request.get_json()
    u = CheckListStates(statelocation=data["location"], state=data["state"])
    db.session.add(u)
    db.session.commit()
    return "success"
@app.route("/checkliststates", methods=["POST"])
def checkliststates():
    data = request.get_json()
    state = CheckListStates.query.filter_by(statelocation=data['location']).first()
    if state:
        state.state = data['state']  # Update the state attribute
        db.session.commit()
        return "success"
    return "State location not found", 404  # Return an error if the record doesn't exist

@app.route("/returncheckliststates", methods=["GET","POST"])
def returncheckliststates():
    data = [i.todict() for i in CheckListStates.query.all()]
    return data