const groupName = document.getElementById('groupName');

const createGroup = () => {
    fetch('/new-group', {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: groupName.value
        })
    }).then(res => {
        return res.json();
    }).then(result => {
        if(result.error){
            console.log('Error creating new group: ' + result.error)
        }
        else{
            console.log(result.success);
            location.pathname = `/${groupName.value}/textchannel/welcome`;
        }
    }).catch(err => {
        console.log(err);
    });
}