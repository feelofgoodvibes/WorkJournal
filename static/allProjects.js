const url = 'http://127.0.0.1:5000/api/v1/projects';
let filterLink = ''
const deleteB = `<button type="button" class="btn btn-danger btn-delete">Delete</button>`
let currentPage = 1

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
            } else {
                next.classList.remove('unactive')
            }
            if (!data.paging.previous) {
                previous.classList.add('unactive')
            } else {
                previous.classList.remove('unactive')
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
    const response = await fetch(`${url}?page=${currentPage - 1}`);
    const data = await response.json();
    const { paging } = data
    if (!paging.next) return
    getDataFetch(paging.next)
}

const getPrevPage = async () => {
    currentPage--;
    const response = await fetch(`${url}?page=${currentPage + 1}`);
    const data = await response.json();
    const { paging } = data
    if (!paging.previous) return
    getDataFetch(paging.previous)
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
        alert.textContent = 'There\'s no projects :('
        insertAfter(alert, table)
        return
    }

    items.forEach(item => {
        tbody.innerHTML += `
    <tr>
            <th scope="row" id="name">${item.name}</th>
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
        filterLink = `${url}?${e.target.id}=`
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
        filterLink = filterLink.slice(0, filterLink.indexOf('=') + 1)
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