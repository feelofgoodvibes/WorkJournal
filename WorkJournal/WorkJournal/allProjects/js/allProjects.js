const url = 'http://workjournal.pythonanywhere.com/api/v1/projects';
let filterLink = ''
const deleteB = `<button type="button" class="btn btn-danger btn-delete">Delete</button>`
let currentPage = 1
const urlPage = `${url}?page=${currentPage}`

function replaceAt(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

const generateTableColums = () => {
    const tr = document.querySelector('.table_tr')
    tr.innerHTML += `<th scope="col">Name</th>`
    tr.innerHTML += `<th scope="col">Id</th>`
    tr.innerHTML += `<th scope="col">Description</th>`
    tr.innerHTML += `<th scope="col col-md-1"></th>`
}

generateTableColums()

const getDataFetch = (url) => {
    let spinner = document.querySelector('.lds-dual-ring');
    const next = document.querySelector('.next');
    const previous = document.querySelector('.previous');
    const page = document.querySelector('.page');
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
            getProjects(data)
        })
        .catch((e) => {
            console.log('Error: ' + e.message);
            console.log(e.response);
        });
}

getDataFetch(`${url}?page=${currentPage}`)

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

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

const getProjects = ({ items }) => {
    console.log(items)
    const tbody = document.querySelector('.table__body')
    const isEmpty = document.querySelector('.emptyList')
    tbody.innerHTML = ''

    if (isEmpty) isEmpty.remove()

    if (items.length === 0) {
        const table = document.querySelector('.table')
        const alert = document.createElement('h2')
        alert.classList.add('emptyList')
        alert.textContent = 'There\'s no projects'
        insertAfter(alert, table)
        return
    }

    items.forEach(item => {
        tbody.innerHTML += `
    <tr>
            <th scope="row" id="name" class="name">${item.name}</th>
            <td id="id">${item.id}</td>
            <td id="description">${item.description}</td>
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

const deleteProject = async (e) => {
    e.target.innerText = 'Loading...'
    const projectId = e.target.parentElement.parentElement.querySelector('#id').textContent
    try {
        const response = await fetch(`${url}/${projectId}`, {
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
        deleteProject(e)
    }
})

document.querySelector('.pagination').addEventListener('click', (e) => {
    if (e.target.classList.contains('previous')) {
        getPrevPage()
    } else if (e.target.classList.contains('next')) {
        getNextPage()
    }
})

document.querySelector('.table__body').addEventListener('click', (e) => {
    if (e.target.classList.contains('name')) {
        const id = e.target.parentElement.querySelector('#id').textContent
        location.href = `http://127.0.0.1:5500/aboutProject/index.html?${id}`
    }
})