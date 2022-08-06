from flask import jsonify, request
from torch import poisson
from objects import *


def serialize(obj):
    if isinstance(obj, list):
        return [i.to_dict() for i in obj]

    return obj.to_dict()

# Employee
@app.route("/api/v1/employees", methods=['GET', "POST"])
def employee():
    if request.args.get("position") and request.args.get("position") not in Position.__members__:
        return jsonify({"count": 0, "items": []}), 200

    search = {
        "name": "%" + request.args.get("name", "") + "%",
        "position": "%" + (str(Position[request.args.get("position")].value) if request.args.get("position") else "") + "%",
        "role": "%" + request.args.get("role", "") + "%",
        "email": "%" + request.args.get("email", "") + "%",
        "phone": "%" + request.args.get("phone", "") + "%"
    }

    if request.method == "GET":
        if request.args.get("page") is not None:
            page = request.args.get("page", 1)

            if not page.isnumeric() or int(page) < 1:
                return jsonify(status="error", message="Argument page should be >= 1"), 400

            paging_query = Employee.query.\
                            filter(Employee.name.like(search["name"]) & Employee.position.like(search["position"]) & \
                                   Employee.role.like(search["role"]) & Employee.email.like(search["email"]) & Employee.phone.like(search["phone"])).\
                            paginate(page=int(page), per_page=DEFAULT_PAGE_COUNT, error_out=False)

            paging_next = request.base_url + "?page=" + str(paging_query.next_num) if paging_query.has_next else None
            paging_prev = request.base_url + "?page=" + str(paging_query.prev_num) if paging_query.has_prev else None

            result = {"items": serialize(paging_query.items), "count": len(paging_query.items), "paging": {"next": paging_next, "previous": paging_prev}}

        else:
            items = Employee.query.\
                            filter(Employee.name.like(search["name"]) & Employee.position.like(search["position"]) & \
                                   Employee.role.like(search["role"]) & Employee.email.like(search["email"]) & Employee.phone.like(search["phone"])).all()
            result = {"items": serialize(items), "count": len(items)}

        return jsonify(result), 200

    elif request.method == "POST":
        name = request.form.get("name")
        position = request.form.get("position")
        role = request.form.get("role")
        email = request.form.get("email")
        phone = request.form.get("phone")

        if name is None or len(name) == 0:
            return jsonify(status="error", message="Name argument is required"), 400

        if position not in [str(i.value) for i in Position] + [i.name for i in Position]:
            return jsonify(status="error", message="Invalid position argument"), 400
        else:
            if position.isnumeric():
                position = int(position)
            else:
                position = Position[position].value


        employee = Employee(name=name, position=position, role=role, email=email, phone=phone)
        db.session.add(employee)
        db.session.commit()

        return jsonify(status="success", item=serialize(employee)), 200


@app.route("/api/v1/employees/<int:emp_id>", methods=["GET", "DELETE", "PUT"])
def employee_id(emp_id):
    if request.method == "GET":
        return serialize(Employee.query.filter(Employee.id==emp_id).first_or_404()), 200
    
    elif request.method == "DELETE":
        db.session.delete(Employee.query.filter(Employee.id==emp_id).first_or_404())
        db.session.commit()

        return jsonify(status="success"), 200

    elif request.method == "PUT":
        employee = Employee.query.filter(Employee.id==emp_id).first_or_404()

        update_fields = {
            "name": request.form.get("name"),
            "position": request.form.get("position"),
            "role": request.form.get("role"),
            "email": request.form.get("email"),
            "phone": request.form.get("phone")
        }

        if name is not None and len(name) == 0:
            return jsonify(status="error", message="Name argument is required"), 400

        if update_fields["position"] is not None:
            if update_fields["position"] not in [str(i.value) for i in Position] + [i.name for i in Position]:
                return jsonify(status="error", message="Invalid position argument"), 400
            else:
                if update_fields["position"].isnumeric():
                    update_fields["position"] = int(update_fields["position"])
                else:
                    update_fields["position"] = Position[update_fields["position"]].value

        for name, value in update_fields.items():
            if value is None: continue
            setattr(employee, name, value)

        db.session.commit()
        return jsonify(status="success", item=serialize(employee)), 200


@app.route("/api/v1/employees/<int:emp_id>/projects", methods=["GET", "POST"])
def employee_id_projects(emp_id):
    if request.method == "GET":
        employee = Employee.query.filter(Employee.id==emp_id).first_or_404()
        return jsonify(count=len(employee.projects), items=serialize(employee.projects)), 200        

    elif request.method == "POST":
        employee = Employee.query.filter(Employee.id==emp_id).first_or_404()
        project_id = request.form.get("project_id")
        
        if project_id is None or not project_id.isnumeric():
            return jsonify(status="error", message="Argument project_id should be integer"), 400

        project = Project.query.filter(Project.id==int(project_id)).first_or_404()
        employee.projects.append(project)
        db.session.commit()

        return jsonify(status="success", item=serialize(employee)), 200


@app.route("/api/v1/employees/<int:emp_id>/projects/<int:project_id>", methods=["DELETE"])
def employee_id_projects_delete(emp_id, project_id):
    employee = Employee.query.filter(Employee.id==emp_id).first_or_404()
    project = Project.query.filter(Project.id==int(project_id)).first_or_404()

    if project not in employee.projects:
        return jsonify(status="erorr", message="This employee does not have that project"), 400

    employee.projects.remove(project)
    db.session.commit()

    return jsonify(serialize(employee)), 200

# ----------------------------------------------------------------------------------

#Project
@app.route("/api/v1/projects", methods=["GET", "POST"])
def project():
    if request.method == "GET":
        search = {
            "name": "%" + request.args.get("name", "") + "%",
            "description": "%" + request.args.get("description", "") + "%",
        }

        if request.args.get("page") is not None:
            page = request.args.get("page", 1)

            if not page.isnumeric() or int(page) < 1:
                return jsonify(status="error", message="Argument page should be >= 1"), 400

            paging_query = Project.query.\
                            filter(Project.name.like(search["name"]) & Project.description.like(search["description"])).\
                            paginate(page=int(page), per_page=DEFAULT_PAGE_COUNT, error_out=False)

            paging_next = request.base_url + "?page=" + str(paging_query.next_num) if paging_query.has_next else None
            paging_prev = request.base_url + "?page=" + str(paging_query.prev_num) if paging_query.has_prev else None

            result = {"items": serialize(paging_query.items), "count": len(paging_query.items), "paging": {"next": paging_next, "previous": paging_prev}}

        else:
            items = Project.query.filter(Project.name.like(search["name"]) & Project.description.like(search["description"])).all()
            result = {"items": serialize(items), "count": len(items)}

        return jsonify(status="success", **result), 200

    elif request.method == "POST":
        name = request.form.get("name")
        description = request.form.get("description")

        if name is None or len(name) == 0:
            return jsonify(status="error", message="Name argument is required"), 400

        project = Project(name=name, description=description)
        db.session.add(project)
        db.session.commit()

        return jsonify(status="success", item=serialize(project)), 200


@app.route("/api/v1/projects/<int:project_id>", methods=["GET", "DELETE", "PUT"])
def project_id(project_id):
    if request.method == "GET":
        return serialize(Project.query.filter(Project.id==project_id).first_or_404()), 200
    
    elif request.method == "DELETE":
        db.session.delete(Project.query.filter(Project.id==project_id).first_or_404())
        db.session.commit()

        return jsonify(status="success"), 200

    elif request.method == "PUT":
        project = Project.query.filter(Project.id==project_id).first_or_404()

        update_fields = {
            "name": request.form.get("name"),
            "description": request.form.get("description")
        }
        
        if update_fields['name'] is not None and len(update_fields['name']) == 0:
            return jsonify(status="error", message="Name argument is required"), 400

        for name, value in update_fields.items():
            if value is None: continue
            setattr(project, name, value)

        db.session.commit()
        return jsonify(status="success", item=serialize(project)), 200
