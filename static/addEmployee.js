const url = 'http://127.0.0.1:5000/api/v1/employees';

const generateFormData = () => {
    let formData = new FormData();
    let email = document.querySelector('#email').value.trim()
    let name = `${document.querySelector('#first-name').value} ${document.querySelector('#second-name').value}`
    let phone = document.querySelector('#phone').value.trim()
    let selectPos = document.querySelector('#position');
    let position = selectPos.options[selectPos.selectedIndex].value.trim();
    let selectRole = document.querySelector('#role');
    let role = selectRole.options[selectRole.selectedIndex].value.trim();

    formData.append('email', email);
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('position', position);
    formData.append('role', role);
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
            addB.textContent = 'Add Employee'
            errorMsg.classList.remove('hidden')
        } else {
            document.querySelector('.form').reset();
            addB.textContent = 'Add Employee'
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