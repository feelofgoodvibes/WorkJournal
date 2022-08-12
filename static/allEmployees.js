const url = '/api/v1/employees';
let filterLink = ''
const deleteB = `<button type="button" class="btn btn-danger btn-delete">Delete</button>`
let currentPage = 1
const urlPage = `${url}?page=${currentPage}`


function replaceAt(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

generateTable = () => {
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
            generateTableColums(data)
        })
        .catch((e) => {
            console.log('Error: ' + e.message);
            console.log(e.response);
        });
}

generateTable()

const getDataFetch = (url) => {
    let spinner = document.querySelector('.lds-dual-ring');
    const next = document.querySelector('.next');
    const previous = document.querySelector('.previous');
    const page = document.querySelector('.page');
    console.log(spinner)
    spinner.classList.remove('hidden');
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
            spinner.classList.add('hidden');
            page.textContent = currentPage
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
            getEmployees(data)
        })
        .catch((e) => {
            console.log('Error: ' + e.message);
            console.log(e.response);
        });
}

getDataFetch(`${url}?page=${currentPage}`)

const generateTableColums = ({ items }) => {
    const tr = document.querySelector('.table_tr')
    for (const key in items[0]) {
        tr.innerHTML += `<th scope="col">${key[0].toUpperCase() + key.slice(1)}</th>`
    }
    tr.innerHTML += `<th scope="col col-md-1"></th>`
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

const getNextPage = async () => {
    currentPage++;
    try {
        const response = filterLink ?
            await fetch(filterLink) :
            await fetch(`${url}?page=${currentPage - 1}`)
        if (filterLink) { filterLink = replaceAt(filterLink, filterLink.indexOf('page') + 5, `${currentPage}`) }
        const data = await response.json();
        const { paging } = data
        if (!paging.next) return
        getDataFetch(paging.next)
    } catch (error) { }
}

const getPrevPage = async () => {
    currentPage--;
    try {
        const response = filterLink ?
            await fetch(filterLink) :
            await fetch(`${url}?page=${currentPage + 1}`)
        if (filterLink) { filterLink = replaceAt(filterLink, filterLink.indexOf('page') + 5, `${currentPage}`) }
        const data = await response.json();
        const { paging } = data
        if (!paging.previous) return
        getDataFetch(paging.previous)
    } catch (error) { }
}


const getEmployees = ({ items }) => {
    const tbody = document.querySelector('.table__body')
    const isEmpty = document.querySelector('.emptyList')
    tbody.innerHTML = ''

    if (isEmpty) isEmpty.remove()

    if (items.length === 0) {
        const table = document.querySelector('.table')
        const alert = document.createElement('h2')
        alert.classList.add('emptyList')
        alert.textContent = 'There\'s no employee'
        insertAfter(alert, table)
        return
    }

    items.forEach(item => {
        tbody.innerHTML += `
        <tr>
            <th scope="row" id="email">${item.email}</th>
            <td id="id" class="id">${item.id}</td>
            <td id="name" class="name">${item.name}</td>
            <td id="phone">${item.phone}</td>
            <td id="position">${item.position}</td>
            <td id="projects">${item.projects.length}</td>
            <td id="role">${item.role}</td>
            <td class="col-md-1">${deleteB}</td>
        </tr>`
    });
}

const onFilterChoose = (e) => {
    const error = document.querySelector('.error')
    error.classList.add('hidden')
    if (e.target.id) {
        filterLink = `${urlPage}&${e.target.id}=`
    }
}

const onSearch = (e) => {
    e.preventDefault();
    const error = document.querySelector('.error')
    const search = document.querySelector('.input-search')
    if (!filterLink) {
        error.classList.remove('hidden')
    }
    if (filterLink.length !== 0) {
        error.classList.add('hidden')
        filterLink = filterLink.slice(0, filterLink.lastIndexOf('=') + 1)
        filterLink += search.value
        getDataFetch(filterLink)
    }
}

const deleteEmployee = async (e) => {
    e.target.innerText = 'Loading...'
    const employeeId = e.target.parentElement.parentElement.querySelector('#id').textContent
    try {
        const response = await fetch(`${url}/${employeeId}`, {
            method: 'DELETE'
        });
        const json = await response.json();
        e.target.innerText = 'Delete'
        console.log(json);
    } catch (error) {
        console.error('Error:', error);
    }
    getDataFetch(`${url}?page=${currentPage}`)
}

document.querySelector('.search').addEventListener('submit', onSearch)

document.querySelectorAll('.filter').forEach(filter => {
    filter.addEventListener('click', onFilterChoose)
})

document.querySelector('.table').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        deleteEmployee(e)
    }
})

document.querySelector('.pagination').addEventListener('click', (e) => {
    console.log(e.target.classList.contains('nextEvent'))
    if (e.target.classList.contains('previousEvent')) {
        getPrevPage()
    } else if (e.target.classList.contains('nextEvent')) {
        getNextPage()
    }
})

document.querySelector('.table__body').addEventListener('click', (e) => {
    if (e.target.classList.contains('name')) {
        const id = e.target.parentElement.querySelector('.id').textContent
        location.href = `/employees/${id}`
    }
})




