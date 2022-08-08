from flask import Flask, redirect, render_template
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from objects import *
from api_endpoints import *


@app.route("/")
def index():
    return redirect("/employees")

@app.route("/employees")
def employees():
    items = Employee.query.all()

    return render_template("employees.html", active="employees", items=[i.to_dict() for i in items])

@app.route("/positions")
def positions():
    return render_template("positions.html", active="positions")

@app.route("/projects")
def projects():
    return render_template("projects.html", active="projects")


if __name__ == "__main__":
    app.run(debug=True)