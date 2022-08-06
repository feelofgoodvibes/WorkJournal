from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from enum import Enum

from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base


basedir = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__)
DATABASE = "database.db"
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{basedir}/{DATABASE}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Constants ---------------------------------
DEFAULT_PAGE_COUNT = 2

# Models ------------------------------------

class Position(Enum):
    Junior = 1
    Middle = 2
    Senior = 3


employee_projects = Table(
    "employee_projects",
    db.Model.metadata,
    Column("employee_id", ForeignKey("employee.id"), primary_key=True),
    Column("project_id", ForeignKey("project.id"), primary_key=True)
)


class Employee(db.Model):
    __tablename__ = "employee"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), nullable=False)
    position = db.Column(db.SmallInteger, nullable=True)
    role = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(25), nullable=True)
    phone = db.Column(db.String(13), nullable=True)
    projects = relationship("Project", secondary=employee_projects, back_populates="employees")

    def to_dict(self, expand=True):
        result = {
            "id": self.id,
            "name": self.name,
            "position": Position(self.position).name,
            "role": self.role,
            "email": self.email,
            "phone": self.phone
        }

        if expand:
            result = {**result, "projects": [ p.to_dict() for p in self.projects]}

        return result

    def __repr__(self):
        return f"Employee-{self.id} {self.name}"


class Project(db.Model):
    __tablename__ = "project"
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=True)
    employees = relationship("Employee", secondary=employee_projects, back_populates="projects")

    def to_dict(self, expand=False):
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }

        if expand:
            result = {**result, "employees": [ p.to_dict(expand=False) for p in self.employees]}

        return result

    def __repr__(self):
        return f"Project-{self.id} {self.name}"


def populate_test_set():
    db.drop_all()
    db.create_all()

    e = (
        Employee(name="Bob K.", position=Position.Junior.value, role="Developer", email='bobk@gmail.com', phone='+380664625512'),
        Employee(name="Nancy B.", position=Position.Middle.value, role="Designer", email='nancysweetie@gmail.com', phone='+380965584216'),
        Employee(name="Sam D.", position=Position.Middle.value, role="Architector", email='serious@gmail.com', phone='+380695874521'),
        Employee(name="Larry P.", position=Position.Senior.value, role="Front End", email='larrypage@gmail.com', phone='+380669531259'),
        Employee(name="Alice S.", position=Position.Junior.value, role="Developer", email='mintyminty@gmail.com', phone='+380665984112')
    )

    p = (
        Project(name="VetHouse", description="Developing site for vet clinic"),
        Project(name="Flovers Data", description="A toolkit for Chicago flower scientists"),
        Project(name="FoodDrive", description="Site for food delivering company")
    )

    for emp in e: db.session.add(emp)
    db.session.commit()
    for prj in p: db.session.add(prj)
    db.session.commit()

    # 1
    e[0].projects.append(p[0])
    e[2].projects.append(p[0])
    e[3].projects.append(p[0])
    # 2
    e[0].projects.append(p[1])
    e[1].projects.append(p[1])
    e[2].projects.append(p[1])
    e[4].projects.append(p[1])
    
    # 3
    e[3].projects.append(p[2])
    e[4].projects.append(p[2])

    db.session.commit()


if __name__ == "__main__":
    # populate_test_set()

    from pprint import pprint

    pprint(Project.query.filter_by(id=3).first().to_dict(expand=True))