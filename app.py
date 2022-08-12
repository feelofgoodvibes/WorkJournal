from flask import Flask, redirect, render_template
from objects import *
from api_endpoints import *


@app.route("/")
def index():
    return redirect("/employees")

@app.route("/employees")
def route_employees():
    return render_template("allEmployees.html")

@app.route("/employees/<int:emp_id>")
def route_employee_id(emp_id):
    return render_template("aboutEmployee.html")

@app.route("/projects")
def route_projects():
    return render_template("allProjects.html")

@app.route("/projects/<int:proj_id>")
def route_projects_id(proj_id):
    return render_template("aboutProject.html")

@app.route("/employees/new")
def route_employees_new():
    return render_template("addEmployee.html")

@app.route("/projects/new")
def route_projects_new():
    return render_template("addProject.html")

if __name__ == "__main__":
    app.run(debug=True)