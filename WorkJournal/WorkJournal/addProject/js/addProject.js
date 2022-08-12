const url = 'http://workjournal.pythonanywhere.com/api/v1/projects';

const generateFormData = () => {
    let formData = new FormData();
    let name = document.querySelector('#name').value,
        description = document.querySelector('#description').value

    formData.append('name', name);
    formData.append('description', description);
    return formData
}

const postItem = async (e) => {
    e.preventDefault();
    const addB = document.querySelector('.btn-add')
    const succesMsg = document.querySelector('.success-msg')
    const errorMsg = document.querySelector('.error-msg')
    errorMsg.classList.add('hidden')
    addB.textContent = 'Loading...'
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: generateFormData(),
        });
        const json = await response.json();
        if (json.status === 'error') {
            errorMsg.textContent += json.message
            addB.textContent = 'Add Project'
            errorMsg.classList.remove('hidden')
        } else {
            document.querySelector('.form').reset();
            addB.textContent = 'Add Project'
            succesMsg.classList.remove('hidden')
            setTimeout(() => {
                succesMsg.classList.add('hidden')
            }, 15000);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

document.querySelector('.form').addEventListener('submit', postItem)

document.querySelector('.form__reset').addEventListener('click', () => {
    document.querySelector('.form').reset();
})