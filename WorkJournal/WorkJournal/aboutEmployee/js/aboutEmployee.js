let idEmployee = location.href.slice(location.href.indexOf('?') + 1)
const url = `http://workjournal.pythonanywhere.com/api/v1/employees/${idEmployee}`
const allProjects = `http://workjournal.pythonanywhere.com/api/v1/projects`
let currentPage = 1

const deleteB = `<button type="button" class="btn btn-danger btn-delete">Delete</button>`
const addB = `<button type="button" class="btn btn-success btn-add">Add</button>`

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
            getEmployeeData(data)
        })
        .catch((e) => {
            console.log('Error: ' + e.message);
            console.log(e.response);
        });
}

getDataFetch(url)

const generateTableColums = (className) => {
    const tr = document.querySelector(className)
    tr.innerHTML += `<th scope="col">Name</th>`
    tr.innerHTML += `<th scope="col">Id</th>`
    tr.innerHTML += `<th scope="col">Description</th>`
    tr.innerHTML += `<th scope="col col-md-1"></th>`
}

const getEmployeeData = ({ id, email, position, role, phone, name }) => {
    document.querySelector('.form').innerHTML += `
                    <!-- Form Group (username)-->
                    <!-- Form Row-->
                    <div class="row gx-3 mb-3">
                        <!-- Form Group (first name)-->
                        <div class="col-md-6">
                            <label class="small mb-1" for="first-name">First Name</label>
                            <input class="form-control" id="first-name" type="text"
                                value="${name.split(' ')[0]}" required="required">
                        </div>
                        <!-- Form Group (last name)-->
                        <div class="col-md-6">
                            <label class="small mb-1" for="second-name">Second Name</label>
                            <input class="form-control" id="second-name" type="text"
                                value="${name.split(' ')[1]}" required="required">
                        </div>
                    </div>
                    <!-- Form Row        -->
                    <div class="row gx-3 mb-3">
                        <!-- Form Group (organization name)-->
                        <div class="col-md-6">
                            <label class="small mb-1" for="position">Position</label>
                            <input class="form-control" list="datalistPosition" id="position" type="text"
                                value="${position}" required="required">
                            <datalist id="datalistPosition">
                                <option value="Junior">
                                <option value="Middle">
                                <option value="Senior">
                            </datalist>
                        </div>
                        <!-- Form Group (location)-->
                        <div class="col-md-6">
                            <label class="small mb-1" for="role">Role</label>
                            <input class="form-control" list="datalistRole" id="role" type="text"
                                value="${role}" required="required">
                            <datalist id="datalistRole">
                                <option value="Developer">
                                <option value="Designer">
                                <option value="Architector">
                                <option value="Front End">
                                <option value="Back End">
                                <option value="Full Stack">
                                <option value="DevOps">
                            </datalist>
                        </div>
                    </div>
                    <!-- Form Group (email address)-->
                    <div class="mb-3">
                        <label class="small mb-1" for="email">Email address</label>
                        <input class="form-control" id="email" type="email"
                            value="${email}" required="required">
                    </div>
                    <div class="mb-3">
                        <label class="small mb-1" for="phone">Phone number</label>
                        <input class="form-control" id="phone" type="tel"
                            value="${phone}" required="required">
                    </div>
                <div class="mb-3">
                        <label style="font-size: 25px;" class="mb-1">Projects</label>
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
                <div class="mb-3 projects hidden">
                        <label style="font-size: 25px;" class="mb-1">All Projects</label>
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
    generateTableColums('.table_tr1')
    getProjectsOfEmployee(url)
    document.querySelector('.btn-add-proj').addEventListener('click', (e) => {
        generateTableColums('.table_tr2')
        getAllProjects(`${allProjects}?page=${currentPage}`)
        e.target.classList.add('hidden')
        document.querySelector('.projects').classList.remove('hidden')
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

const editEmployee = async (e) => {
    e.preventDefault();
    const editB = document.querySelector('.btn-edit')
    const succesMsg = document.querySelector('.success-msg')
    const errorMsg = document.querySelector('.error-msg')
    errorMsg.classList.add('hidden')
    editB.textContent = 'Loading...'
    try {
        const response = await fetch(url, {
            method: 'PUT',
            body: generateFormData(),
        });
        console.log(response)
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
        email = document.querySelector('#email').value.trim(),
        name = `${document.querySelector('#first-name').value} ${document.querySelector('#second-name').value}`,
        phone = document.querySelector('#phone').value.trim(),
        position = document.querySelector('#position').value.trim(),
        role = document.querySelector('#role').value.trim();

    formData.append('email', email);
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('position', position);
    formData.append('role', role);
    return formData
}

const getProjectsOfEmployee = (url) => {
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
            getProjects(data)
        })
        .catch((e) => {
            console.log('Error: ' + e.message);
            console.log(e.response);
        });
}

const getProjects = ({ projects }) => {
    console.log(projects)
    const tbody = document.querySelector('.table__body')
    const isEmpty = document.querySelector('.emptyList')
    tbody.innerHTML = ''

    if (isEmpty) isEmpty.remove()

    if (projects.length === 0) {
        const table = document.querySelector('.table')
        const alert = document.createElement('h2')
        alert.classList.add('emptyList')
        alert.textContent = 'There\'s no projects'
        insertAfter(alert, table)
        return
    }

    projects.forEach(item => {
        tbody.innerHTML += `
    <tr>
            <th scope="row" id="name">${item.name}</th>
            <td id="id">${item.id}</td>
            <td id="description">${item.description}</td>
            <td class="col-md-1">${deleteB}</td>
    </tr>`
    });
}

const getAllProjects = (url) => {
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
        alert.textContent = 'There\'s no projects'
        insertAfter(alert, table)
        return
    }

    items.forEach(item => {
        tbody.innerHTML += `
    <tr>
            <th scope="row" id="name2">${item.name}</th>
            <td id="id2">${item.id}</td>
            <td id="description2">${item.description}</td>
            <td class="col-md-1">${addB}</td>
    </tr>`
    });
}

const deleteProject = async (e) => {
    e.target.innerText = 'Loading...'
    const projectId = e.target.parentElement.parentElement.querySelector('#id').textContent
    console.log(`${allProjects}/${projectId}`)
    console.log(projectId)
    try {
        const response = await fetch(`${url}/projects/${projectId}`, {
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

const addProjectToEmployee = async (e) => {
    e.target.innerText = 'Loading...'
    const projectId = e.target.parentElement.parentElement.querySelector('#id2').textContent
    let formData = new FormData();
    formData.append('project_id', +projectId)
    console.log(projectId)
    try {
        const response = await fetch(`${url}/projects`, {
            method: 'POST',
            body: formData
        });
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
    const response = await fetch(`${allProjects}?page=${currentPage - 1}`);
    const data = await response.json();
    const { paging } = data
    if (!paging.next) return
    getAllProjects(paging.next)
}

const getPrevPage = async () => {
    currentPage--;
    const response = await fetch(`${allProjects}?page=${currentPage + 1}`);
    const data = await response.json();
    const { paging } = data
    if (!paging.previous) return
    getAllProjects(paging.previous)
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

document.querySelector('.form').addEventListener('submit', editEmployee)

document.querySelector('.form').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-add')) {
        addProjectToEmployee(e)
    }
    if (e.target.classList.contains('btn-delete')) {
        deleteProject(e)
    }
})
