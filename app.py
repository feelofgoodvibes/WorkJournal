from flask import Flask, redirect, render_template
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from objects import *
from api_endpoints import *


@app.route("/")
def index():
    return redirect("/employees")

@app.route("/employees/page/<int:page>")
def employees(page):
    items = get_employees(page)
    return render_template("employees.html", active="employees", items=items)

@app.route("/projects/page/<int:page>")
def projects(page):
    items = get_projects(page)
    return render_template("projects.html", active="projects", items=items)


if __name__ == "__main__":
    app.run(debug=True)