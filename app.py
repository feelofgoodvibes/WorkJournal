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
    return render_template("allEmployees.html")

# @app.route("/employees/<int:emp_id>")
# def employee_id():
#     return render_template("")

@app.route("/projects")
def projects():
    return render_template("allProjects.html")


@app.route("/employees/new")
def employees_new():
    return render_template("addEmployee.html")

if __name__ == "__main__":
    app.run(debug=True)