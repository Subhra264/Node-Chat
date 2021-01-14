const name = document.getElementById('name');
const email = document.getElementById('email');
const password = document.getElementById('password');

const submitForm = (e) => {
    e.preventDefault();

    fetch('/signup', {
        method: 'POST',
        body: JSON.stringify({
            name: name.value,
            email: email.value,
            password: password.value
        })
    }).then(res => {
        return res.json();
    }).then(result => {
        if(result.error){
            console.log(result.error);
        }
        else{
            console.log(result.success);
            location.pathname = "/login";
        }
    }).catch(err => {
        console.log(err);
    });
}
