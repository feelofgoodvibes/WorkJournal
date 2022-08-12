let idProject = location.href.slice(location.href.indexOf('?') + 1)
const url = `/api/v1/projects/${idProject}`
const allEmployees = `/api/v1/employees`
let currentPage = 1

const deleteB = `<button type="button" class="btn btn-danger btn-delete">Delete</button>`,
    addB = `<button type="button" class="btn btn-success btn-add">Add</button>`;

const getDataFetch = (url) => {
    fetch(url)
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                let error = new Error(res.statusText);
                error.response = res;
                throw error;
            }
        })
        .then(data => {
            console.log(data)
            getEmployeeData(data)
        })
        .catch((e) => {
            console.log('Error: ' + e.message);
            console.log(e.response);
        });
}

getDataFetch(url)

const generateTableColums = (employees, tableName) => {
    const tr = document.querySelector(tableName)
    for (const key in employees[0]) {
        if (key === 'link') continue
        tr.innerHTML += `<th scope="col">${key[0].toUpperCase() + key.slice(1)}</th>`
    }
    tr.innerHTML += `<th scope="col col-md-1"></th>`
}

const getEmployeeData = ({ name, description, employees }) => {
    document.querySelector('.form').innerHTML += `
                        <!--Name-->
                        <div class="mb-3">
                            <label class="small mb-1" for="name">Name</label>
                            <input class="form-control" id="name" type="text"
                                value="${name}" required="required">
                        </div>
                        <!-- Description-->
                        <div class="mb-3">
                            <label class="small mb-1" for="description">Description</label>
                            <textarea class="form-control" id="description" rows="3"
                            >${description}</textarea>
                        </div>
                <div class="mb-3">
                    <label style="font-size: 25px;" class="mb-1">Employees</label>
                    <table class="table table-hover table1">
                        <thead class="table__head">
                            <tr class="table_tr1 table-dark">
                            </tr>
                        </thead>
                        <tbody class="table__body">
                        </tbody>
                    </table>
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn btn-primary btn-add-proj">Add project</button>
                    </div>
                </div>
                <div class="mb-3 employees hidden">
                        <label style="font-size: 25px;" class="mb-1">All Employees</label>
                        <table class="table table-hover table2">
                            <thead class="table__head2">
                                <tr class="table_tr2 table-dark">
                                </tr>
                            </thead>
                            <tbody class="table__body2">
                            </tbody>
                        </table>
                        <nav aria-label="Page navigation example">
                            <ul class="pagination pagination-black justify-content-center">
                                <li class="page-item"><a class="page-link previous previousEvent" href="#">Prev</a></li>
                                <li class="page-item"><a class="page-link page" href="#">1</a></li>
                                <li class="page-item"><a class="page-link next nextEvent" href="#">Next</a></li>
                            </ul>
                         </nav>
                </div>
                <div class="success-msg hidden">
                    <i class="fa fa-check"></i>
                    The employee was edited successfully
                </div>
                <div class="error-msg hidden">
                    <i class="fa fa-times-circle"></i>
                    Error editing employee:
                </div>
                    <!-- Save changes button-->
                    <button class="btn btn-dark btn-edit" type="submit">Save changes</button>
                
    `
    generateTableColums(employees, '.table_tr1')
    getEmployeesOfProject(url)
    document.querySelector('.form').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-proj')) {
            generateTableColums(employees, '.table_tr2')
            getAllEmployees(`${allEmployees}?page=${currentPage}`)
            e.target.classList.add('hidden')
            document.querySelector('.employees').classList.remove('hidden')
        }
    })
    document.querySelector('.pagination').addEventListener('click', (e) => {
        e.preventDefault()
        if (e.target.classList.contains('previousEvent')) {
            getPrevPage()
        } else if (e.target.classList.contains('nextEvent')) {
            getNextPage()
        }
    })
}

const editProject = async (e) => {
    e.preventDefault();
    const editB = document.querySelector('.btn-edit'),
        succesMsg = document.querySelector('.success-msg'),
        errorMsg = document.querySelector('.error-msg');
    errorMsg.classList.add('hidden')
    editB.textContent = 'Loading...'
    try {
        const response = await fetch(url, {
            method: 'PUT',
            body: generateFormData(),
        });
        const json = await response.json();
        if (json.status === 'error') {
            errorMsg.textContent += json.message
            editB.textContent = 'Save changes'
            errorMsg.classList.remove('hidden')
        } else {
            editB.textContent = 'Save changes'
            succesMsg.classList.remove('hidden')
            setTimeout(() => {
                succesMsg.classList.add('hidden')
            }, 15000);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

const generateFormData = () => {
    let formData = new FormData(),
        name = document.querySelector('#name').value,
        description = document.querySelector('#description').value;

    formData.append('name', name);
    formData.append('description', description);
    return formData
}

const getEmployeesOfProject = (url) => {
    fetch(url)
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                let error = new Error(res.statusText);
                error.response = res;
                throw error;
            }
        })
        .then(data => {
            console.log(data)
            getEmployees(data)
        })
        .catch((e) => {
            console.log('Error: ' + e.message);
            console.log(e.response);
        });
}

const getEmployees = ({ employees }) => {
    const tbody = document.querySelector('.table__body')
    const isEmpty = document.querySelector('.emptyList')
    tbody.innerHTML = ''

    if (isEmpty) isEmpty.remove()

    if (employees.length === 0) {
        const table = document.querySelector('.table')
        const alert = document.createElement('h2')
        alert.classList.add('emptyList')
        alert.textContent = 'There\'s no employee :('
        insertAfter(alert, table)
        return
    }

    employees.forEach(item => {
        tbody.innerHTML += `
        <tr>
            <th scope="row" id="email">${item.email}</th>
            <td id="id" class="id">${item.id}</td>
            <td id="name" class="name">${item.name}</td>
            <td id="phone">${item.phone}</td>
            <td id="position">${item.position}</td>
            <td id="role">${item.role}</td>
            <td class="col-md-1">${deleteB}</td>
        </tr>`
    });

}

const deleteProject = async (e) => {
    e.target.innerText = 'Loading...'
    const employeeId = e.target.parentElement.parentElement.querySelector('#id').textContent
    console.log(employeeId)
    console.log(`${url}/employees/${employeeId}`)
    try {
        const response = await fetch(`${allEmployees}/${employeeId}/projects/${idProject}`, {
            method: 'DELETE'
        });
        const json = await response.json();
        e.target.innerText = 'Delete'
        console.log(json);
    } catch (error) {
        console.error('Error:', error);
    }
    window.location.reload();
}

const getAllEmployees = (url) => {
    const next = document.querySelector('.next'),
        previous = document.querySelector('.previous'),
        page = document.querySelector('.page');
    fetch(url)
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                let error = new Error(res.statusText);
                error.response = res;
                throw error;
            }
        })
        .then(data => {
            console.log(data)
            page.textContent = currentPage
            paginationEventEdit(data, next, previous)
            setAllProjects(data)
        })
        .catch((e) => {
            console.log('Error: ' + e.message);
            console.log(e.response);
        });
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

const setAllProjects = ({ items }) => {
    const tbody = document.querySelector('.table__body2')
    const isEmpty = document.querySelector('.emptyList2')
    tbody.innerHTML = ''

    if (isEmpty) isEmpty.remove()

    if (items.length === 0) {
        const table = document.querySelector('.table2')
        const alert = document.createElement('h2')
        alert.classList.add('emptyList2')
        alert.textContent = 'There\'s no employee'
        insertAfter(alert, table)
        return
    }

    items.forEach(item => {
        tbody.innerHTML += `
        <tr>
            <th scope="row" id="email2">${item.email}</th>
            <td id="id2" class="id">${item.id}</td>
            <td id="name2" class="name">${item.name}</td>
            <td id="phone2">${item.phone}</td>
            <td id="position2">${item.position}</td>
            <td id="role2">${item.role}</td>
            <td class="col-md-1">${addB}</td>
        </tr>`
    });
}

const addEmployeeToProject = async (e) => {
    e.target.innerText = 'Loading...'
    const employeeId = e.target.parentElement.parentElement.querySelector('#id2').textContent
    let formData = new FormData();
    formData.append('project_id', +idProject)
    try {
        const response = await fetch(`${allEmployees}/${employeeId}/projects`, {
            method: 'POST',
            body: formData
        });
        console.log(response)
        const json = await response.json();
        e.target.innerText = 'Add'
        console.log(json);
    } catch (error) {
        console.error('Error:', error);
    }
    window.location.reload();
}

const getNextPage = async () => {
    currentPage++;
    const response = await fetch(`${allEmployees}?page=${currentPage - 1}`);
    const data = await response.json();
    const { paging } = data
    if (!paging.next) return
    getAllEmployees(paging.next)
}

const getPrevPage = async () => {
    currentPage--;
    const response = await fetch(`${allEmployees}?page=${currentPage + 1}`);
    const data = await response.json();
    const { paging } = data
    if (!paging.previous) return
    getAllEmployees(paging.previous)
}


const paginationEventEdit = (data, next, previous) => {
    if (!data.paging.next) {
        next.classList.add('unactive')
        next.classList.remove('nextEvent')
    } else {
        next.classList.remove('unactive')
        next.classList.add('nextEvent')
    }
    if (!data.paging.previous) {
        previous.classList.add('unactive')
        previous.classList.remove('previousEvent')
    } else {
        previous.classList.remove('unactive')
        previous.classList.add('previousEvent')
    }
}


document.querySelector('.form').addEventListener('submit', editProject)

document.querySelector('.form').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-add')) {
        addEmployeeToProject(e)
    }
    if (e.target.classList.contains('btn-delete')) {
        deleteProject(e)
    }
})
