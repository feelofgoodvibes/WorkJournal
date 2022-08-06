from flask import jsonify, request
from torch import poisson
from objects import *


def serialize(obj):
    if isinstance(obj, list):
        return [i.to_dict() for i in obj]

    return obj.to_dict()

# Employee
@app.route("/api/v1/employee", methods=['GET', "POST"])
def employee():
    if request.method == "GET":
        if request.args.get("page") is not None:
            page = request.args.get("page", 1)

            if not page.isnumeric() or int(page) < 1:
                return jsonify(status="error", message="Argument page should be >= 1"), 400

            paging_query = Employee.query.paginate(page=int(page), per_page=DEFAULT_PAGE_COUNT, error_out=False)

            paging_next = request.base_url + "?page=" + str(int(page)+1) if paging_query.has_next else None
            paging_prev = request.base_url + "?page=" + str(int(page)-1) if paging_query.has_prev else None

            result = {"items": serialize(paging_query.items), "count": len(paging_query.items), "paging": {"next": paging_next, "previous": paging_prev}}

        else:
            items = Employee.query.all()
            result = {"items": serialize(items), "count": len(items)}

        return jsonify(status="success", **result), 200

    elif request.method == "POST":
        name = request.form.get("name")
        position = request.form.get("position")
        role = request.form.get("role")
        email = request.form.get("email")
        phone = request.form.get("phone")

        if name is None:
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


@app.route("/api/v1/employee/<int:emp_id>", methods=["GET", "DELETE", "PUT"])
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


#Project
