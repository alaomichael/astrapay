(() => {
    const message = document.querySelector('#message');

    // check if the Geolocation API is supported
    if (!navigator.geolocation) {
        message.textContent = `Your browser doesn't support Geolocation`;
        message.classList.add('error');
        return;
    }

    // handle click event
    const btn = document.querySelector('#show');
    btn.addEventListener('click', function() {
        // get the current position
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });


    // handle success case
    function onSuccess(position) {
        const {
            latitude,
            longitude
        } = position.coords;

        // Show on the console added by me
        console.log('Position info:', position);

        message.classList.add('success');
        message.textContent = `Your location: (${latitude},${longitude})`;
    }

    // handle error case
    function onError() {
        message.classList.add('error');
        message.textContent = `Failed to get your location!`;
    }
})();
CLOUDINARY_API = https: //api.cloudinary.com/v1_1/dguaclaav/video/upload
    CLOUDINARY_UPLOAD_PRESET = mt3alicw / video / upload

let imgPreview = document.getElementById('img-preview');
let fileUpload = document.getElementById('file-upload');

fileUpload.addEventListener('change', function(event) {
    let file = event.target.files[0];

    let formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    axios({
        url: CLOUDINARY_API,
        method: {
            'Content-Type': 'applictaion/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Header': 'Origin',
            'Access-Control-Allow-Credentials': true,
        },
        data: formData
    }).then(function(res) {
        console.log(res);
        imgPreview.src = res.data.source_url;
    }).catch(function(err) {
        console.log(err);
    });

});