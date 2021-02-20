const email = document.getElementById('email');
const password = document.getElementById('password');
const submitButton = document.getElementById('submit');

submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('submitting the form!');

    fetch('/log-in', {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    }).then(res => {
        return res.json();
    }).then(result => {
        if(result.error){
            console.log(result.error);
            const errorContainer = document.getElementById('error-container');
            errorContainer.innerText = result.error;
            errorContainer.style.display = 'block';
        }
        else{
            console.log(result.success);
            location.pathname = "/help";
        }
    }).catch(err => {
        console.log(err);
    });
})

