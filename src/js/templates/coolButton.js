// This is additional js file, that can be imported to any of another js files. It is currently imported into pages/index.js

let counter = 0
$('button').click(function () {
    counter++
    alert(`you clicked ${counter} times!`)
})
