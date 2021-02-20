const name = document.getElementById('name');
const email = document.getElementById('email');
const password = document.getElementById('password');
const submitButton = document.getElementById('submit');

submitButton.addEventListener('click', (e) => {
    e.preventDefault();

    fetch('/sign-up', {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            name: name.value,
            email: email.value,
            password: password.value
        })
    }).then(res => {
        return res.json();
    }).then(result => {
        console.log(result);
        if(result.error){
            console.log(result.error);
        }
        else{
            console.log(result.success);
            location.pathname = "/log-in";
        }
    }).catch(err => {
        console.log(err);
    });
});

