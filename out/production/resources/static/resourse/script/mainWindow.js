
window.onload = function () {

    // console.log(session.getObject("loginuser"));
    if(session.getObject("loginuser") != null){
        loggedUserName = session.getObject("loginuser").loginusername;
        lblLogUser.innerHTML = loggedUserName;
        loggedUser = httpRequest("/user/getuser/"+loggedUserName , "GET" );
        session.setObject('activeuser', loggedUser);

        // lblLoggedAsUser.innerHTML = loggedUser.employeeId.designationId.name;
        // session.setObject('activeuser', loggedUser);

        if(loggedUser.employeeId != undefined){
            if(loggedUser.employeeId.photo != null){
                profileImage.src = atob(loggedUser.employeeId.photo);
            }

            else
                profileImage.src = 'resourse/image/nouser.jpg';
        }else {
            profileImage.src = 'resourse/image/nouser.jpg';
            // window.location.href = "http://localhost:8080/login";
        }
    }else
        window.location.href = "http://localhost:8080/login";




    if(session.getObject("activeuser").employeeId.id !=1) {
        usermodulelist = httpRequest("../module/listbyuser?userid=" + session.getObject("activeuser").id, "GET");

        allmoduleList = httpRequest("../module/list", "GET");

        dislist = listCompera(allmoduleList,usermodulelist,"id","name");

        console.log(dislist);
        for (x in dislist) {
            mname = dislist[x].name;

            var lielemet =  document.getElementById(mname);
            if(lielemet != null)
                document.getElementById(mname).remove();

            var uielement =  document.getElementsByClassName(mname);
            console.log(uielement);
            if(uielement.length != 0){
                for(var i=0 ; i<uielement.length ; i++ ){
                uielement[i].style.display = "none";
                }

            }
        }

    }

}

/* ---------------------------------------------------
    SIDE BAR COLLAPSE BUTTON
----------------------------------------------------- */


$(document).ready(function () {


    $('#dismiss, .overlay').on('click', function () {
        $('#sidebar').removeClass('active');
        $('.overlay').removeClass('active');
    });

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').addClass('active');
        $('.overlay').addClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });
});


function btnSignoutMC() {
    swal({
        title: "Do you want to sign out?",
        text: " ",
        icon: "warning",
        buttons: true,
        closeOnClickOutside: false
    }).then((willDelete) => {
        if (willDelete) {
            swal({
                title: "Sign Out Successful",
                text: " ",
                icon: "success",
                timer: 1500,
                buttons: false,
                closeOnClickOutside: false
            }).then(() => {
                window.location.assign('/logout');
        });

        }
    });
}