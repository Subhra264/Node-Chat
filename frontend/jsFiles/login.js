const email = document.getElementById('email');
const password = document.getElementById('password');

const submitForm = (e) => {
    e.preventDefault();
    console.log('submitting the form!');

    fetch('/signin', {
        method: 'POST',
        body: JSON.stringify({
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
            location.pathname = "/help";
        }
    }).catch(err => {
        console.log(err);
    });
}
