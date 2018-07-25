    //io connection
    var socket = io.connect('http://localhost:3000');
    //login event
    $("#login button").on('click',function() {
        //must enter a name
        var name = $("#login input").val();
        if (name.trim() == "") {
            $("#check_info").text('Please enter a name');
            return;
        }
        //check if enter a name that has been used
        $.get('/check', {name: name}, function (data) {
            if (data) {
                $("#check_info").text('This name has been used, please enter another name.');
            } else {
                //if a valid name is entered
                //send request with the name value to server
                var myself = name;
                socket.emit('login', name);
                //hide log in window and show the chatting room window
                $('#login').hide();
                $('#chat').show();
                //listen to server signin event and send welcome message to other members except self
                socket.on('signin', function (data) {
                    $('#list').append($("<p style='color:blue;font-size: 18px;'>System Information: " + data + " comes in, welcome!!!</p>"))
                })
                socket.on('signin_info', function (data) {
                    //update the number of online members
                    $('#status span').text(data.count);
                    $('#status ul').empty();
                    //users format:{tom:"tom",jin:"jin"}
                    $.each(data.users, function (key, val) {
                        $('#status ul').append($('<li>' + val + '</li>'));
                    })
                })
                //send server the post message from a user
                $('#publish button').click(function () {
                    socket.emit('publish', $('#publish input').val());
                })
                //listen to the chat event and receive posted mesage from users
                socket.on('chat', function (data) {
                    //if the message is from self, post message to the right side of screen and show the name as "I"
                    if (data.user == myself) {
                        data.user = "I";
                        $('#list').append($('<p style="overflow: hidden;"><span style="float:right;margin-right:15px;">' + data.user + ': ' + data.msg + '</span></p>'));
                        
                    } else {
                        //if not self, list user name and message
                        $('#list').append($('<p>' + data.user + ': ' + data.msg + '</p>'));
                        
                    }
                })
                //if window is closed or refreshed, register log out event
                socket.on('logout', function (data) {
                    //tell other members who left
                    $('#list').append($('<p style="color:darkred;font-size: 18px;">System Information: ' + data + ' just left...</p>'))
                })

            }
        })
    })