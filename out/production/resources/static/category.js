window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchcatname.addEventListener("keyup",btnCatSearchMC);
    txtSearchsubname.addEventListener("keyup",btnSubSearchMC);
    privilages = httpRequest("../privilage?module=CATEGORY","GET");
    privilages = httpRequest("../privilage?module=SUBCATEGORY","GET");

    //Data services for Combo Boxes
    categories = httpRequest("../category/list","GET");


    valid = "3px solid green";
    invalid = "3px solid red";
    initial = "3px solid #d6d6c2";
    updated = "3px solid #ff9900";
    active = "#ff9900";

    loadForm();
    loadView();
    loadForm2();
    loadView2();
    disableButtons(false, true, true);

}

function loadView() {

    //Search Area
    txtSearchcatname.value="";
    txtSearchcatname.style.background = "";

    //Table Area
    activerowno = "";
    activepage = 1;
    var query = "&searchtext=";
    loadTable(1,cmbPagesize.value,query);
}

function loadTable(page,size,query) {
    page = page - 1;
    categories = new Array();
    var data = httpRequest("/category/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) categories = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblCategory',categories,null,btnDeleteMC,null);
    clearSelection(tblCategory);

    if(activerowno!="")selectRow(tblCategory,activerowno,active);
    tblCategory.children[0].children[0].children[1].children[0].style.display = "none";

    if(category != 0){
        for(var i =0; i< tblCategory.children[1].children.length; i++){
            tblCategory.children[1].children[i].lastChild.firstChild.style.visibility = "hidden";
            tblCategory.children[1].children[i].lastChild.lastChild.style.visibility = "hidden";
        }
    }

}


function paginate(page) {
    var paginate;
    if(oldcategory==null){
        paginate=true;
    }else{
        if(getErrors()==''&&getUpdates()==''){
            paginate=true;
        }else{
            paginate = window.confirm("Form has Some Errors or Update Values. " +
                "Are you sure to discard that changes ?");
        }
    }
    if(paginate) {
        activepage=page;
        activerowno="";
        loadSearchedTable();
        loadForm();
    }

}


function loadForm() {
    category = new Object();
    oldcategory = null;

    txtCategory.value = "";

    setStyle(initial);

    disableButtons(false, true, true);
}

function setStyle(style) {
    txtCategory.style.border = style;
}

function disableButtons(add, upd, del) {

    if (add || !privilages.add) {
        btnAdd1.setAttribute("disabled", "disabled");
        $('#btnAdd1').css('cursor','not-allowed');
    }
    else {
        btnAdd1.removeAttribute("disabled");
        $('#btnAdd1').css('cursor','pointer')
    }


    if (!privilages.delete){
        $(".buttondel").prop('disabled', true);
        $(".buttondel").css('cursor','not-allowed');
    }
    else {
        $(".buttondel").removeAttr("disabled");
        $(".buttondel").css('cursor','pointer');
    }

}

function getErrors() {

    var errors = "";
    addvalue = "";

    if (category.name == null){
        errors = errors + "\n" + "Category Name Not Enter";
        txtCategory.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;

}

function btnAddMC(){

    if(getErrors()==""){
        savedata();
    }else{
        swal({
            title: "You have following errors",
            text: "\n"+getErrors(),
            icon: "error",
            button: true,
            closeOnClickOutside: false,
        });

    }
}

function savedata() {

    swal({
        title: "Are you sure to add following Category...?" ,
        text :  "\nCategory Name : " + category.name,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/category", "POST", category);
            if (response == "0") {
                swal({
                    position: 'center',
                    icon: 'success',
                    title: 'Your work has been Done \n Save SuccessFully..!',
                    text: '\n',
                    button: false,
                    timer: 1200
                });
                loadForm();
                activerowno = 1;
                loadSearchedTable();
            }
            else swal({
                title: 'Save not Success... , You have following errors', icon: "error",
                text: '\n ' + response,
                button: true,
                closeOnClickOutside: false,
            });
        }
    });

}

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if(oldcategory == null && addvalue == ""){
        loadForm();
    }else{
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n" ,
            icon: "warning",
            buttons: true,
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willClear) => {
            if (willClear) {
                loadForm();
            }

        });
    }
}

function btnCloseMCCat(){
    checkerror = getErrors();

    if(oldcategory==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#catformmodal').modal('hide');
                    loadForm();
                }
            });
        }else{
            $('#catformmodal').modal('hide');
            loadForm();
        }

    }
    else{
        if(getErrors()==''&&getUpdates()==''){
            $('#catformmodal').modal('hide');
            loadForm();
        }else{
            swal({
                title: "Form has Some Update Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#catformmodal').modal('hide');
                    loadForm();
                }else{

                }
            });
        }
    }
}

function btnDeleteMC(sub) {
    category = JSON.parse(JSON.stringify(sub));

    swal({
        title: "Are you sure to delete following Category...?",
        text :"\nCategory Name : " + category.name,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/category","DELETE",category);
            if (responce==0) {
                swal({
                    title: "Deleted Successfully....!",
                    text: "\n\n  Status change to delete",
                    icon: "success",
                    button: false,
                    timer: 1200,
                });
                loadForm();
                loadSearchedTable();
            } else {
                swal({
                    title: "You have following erros....!",
                    text: "\n\n" + responce,
                    icon: "error",
                    button: true,
                    closeOnClickOutside: false,
                });
            }
        }
    });

}


function loadSearchedTable() {

    var searchtext = txtSearchcatname.value;

    var query ="&searchtext=";

    if(searchtext!="")
        query = "&searchtext=" + searchtext;
    //window.alert(query);
    loadTable(activepage, cmbPagesize.value, query);

}

function btnCatSearchMC(){
    activepage=1;
    loadSearchedTable();
}

function btnCatSearchClearMC(){
    loadView();
}

function btnPrintTableMC(category) {

    var newwindow=window.open();
    formattab = tblCategory.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Category Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}












///////////////////////////////////////////////////SUBCATEGORY///////////////////////////////////////////////////////////////////
function loadView2() {

     //Search Area
    txtSearchsubname.value="";
    txtSearchsubname.style.background = "";

    //Table Area
    activerowno = "";
    activepage = 1;
    var query = "&searchtext=";
    loadTable2(1,cmbPagesize2.value,query);
}

function loadTable2(page,size,query) {
    page = page - 1;
    subcategories = new Array();
    var data = httpRequest("/subcategory/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) subcategories = data.content;
    createPagination('pagination2',data.totalPages, data.number+1,paginate2);
    fillTable('tblSubcategory',subcategories,fillForm,btnDeleteMC2,null);
    clearSelection(tblSubcategory);

    if(activerowno!="")selectRow(tblSubcategory,activerowno,active);

    if(subcategory != 0){
        for(var i =0; i< tblSubcategory.children[1].children.length; i++){
            tblSubcategory.children[1].children[i].lastChild.style.paddingLeft = "40px";
            tblSubcategory.children[1].children[i].lastChild.lastChild.style.display = "none";
        }
    }

}

function paginate2(page) {
    var paginate2;
    if(oldsubcategory==null){
        paginate2=true;
    }else{
        if(getErrors2()==''){
            paginate2=true;
        }else{
            paginate2 = window.confirm("Form has Some Errors or Update Values. " +
                "Are you sure to discard that changes ?");
        }
    }
    if(paginate2) {
        activepage=page;
        activerowno=""
        loadSearchedTable2();
        loadForm2();
    }

}



function loadForm2() {
    subcategory = new Object();
    oldsubcategory = null;

    fillCombo(cmbCategory1, "Select Category", categories, "name");

    $("#chkClose").prop("checked", false);

    txtSubcategory.value = "";
    cmbCategory1.value = "";

    setStyle2(initial);

    disableButtons2(false, true, true);
}


function setStyle2(style) {
    txtSubcategory.style.border = style;
    cmbCategory1.style.border = style;
}


function disableButtons2(add, upd, del) {

    if (add || !privilages.add) {
        btnAdd.setAttribute("disabled", "disabled");
        $('#btnAdd').css('cursor','not-allowed');
    }
    else {
        btnAdd.removeAttribute("disabled");
        $('#btnAdd').css('cursor','pointer')
    }

    if (upd || !privilages.update) {
        btnUpdate.setAttribute("disabled", "disabled");
        $('#btnUpdate').css('cursor','not-allowed');
    }
    else {
        btnUpdate.removeAttribute("disabled");
        $('#btnUpdate').css('cursor','pointer');
    }

    if (!privilages.update) {
        $(".buttonup").prop('disabled', true);
        $(".buttonup").css('cursor','not-allowed');
    }
    else {
        $(".buttonup").removeAttr("disabled");
        $(".buttonup").css('cursor','pointer');
    }

    if (!privilages.delete){
        $(".buttondel").prop('disabled', true);
        $(".buttondel").css('cursor','not-allowed');
    }
    else {
        $(".buttondel").removeAttr("disabled");
        $(".buttondel").css('cursor','pointer');
    }

}


function getErrors2() {

    var errors = "";
    addvalue = "";

    if (subcategory.name == null){
        errors = errors + "\n" + "Sub Categoey Name Not Enter";
        txtSubcategory.style.border = invalid;
    }
    else  addvalue = 1;

    if (subcategory.categoryId == null){
        errors = errors + "\n" + "Category Not Selected";
        cmbCategory1.style.border = invalid;
    }

    return errors;

}

function btnAddMC2(){

    if(getErrors2()==""){
        savedata2();
    }else{
        swal({
            title: "You have following errors",
            text: "\n"+getErrors2(),
            icon: "error",
            button: true,
            closeOnClickOutside: false,
        });

    }
}

function savedata2() {

    swal({
        title: "Are you sure to add following Subcategory...?" ,
        text :  "\nSub Category Name : " + subcategory.name +
            "\nCategory : " + subcategory.categoryId.name,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/subcategory", "POST", subcategory);
            if (response == "0") {
                swal({
                    position: 'center',
                    icon: 'success',
                    title: 'Your work has been Done \n Save SuccessFully..!',
                    text: '\n',
                    button: false,
                    timer: 1200
                });
                $(document).ready(function(){
                    if($('#chkClose').prop("checked") == true){
                        loadForm2();
                    }else if($('#chkClose').prop("checked") == false){
                        $('#formmodal').modal('hide');
                        loadForm();
                    }
                });
                activerowno = 1;
                loadSearchedTable2();
            }
            else swal({
                title: 'Save not Success... , You have following errors', icon: "error",
                text: '\n ' + response,
                button: true,
                closeOnClickOutside: false,
            });
        }
    });

}

function btnClearMC2() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors2();

    if(oldsubcategory == null && addvalue == ""){
        loadForm2();
    }else{
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n" ,
            icon: "warning",
            buttons: true,
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willClear) => {
            if (willClear) {
                loadForm2();
            }

        });
    }
}

function btnCloseMC2(){
    checkerror = getErrors2();

    if(oldsubcategory==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm2();
                }
            });
        }else{
            $('#formmodal').modal('hide');
            loadForm2();
        }

    }
    else{
        if(getErrors2()==''&&getUpdates()==''){
            $('#formmodal').modal('hide');
            loadForm2();
        }else{
            swal({
                title: "Form has Some Update Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm2();
                }
            });
        }
    }
}



function fillForm(sub,rowno){
    activerowno = rowno;
    
    clearSelection(tblSubcategory);
    disableButtons(true, false, false);
    selectRow(tblSubcategory,activerowno,active);

    subcategory = JSON.parse(JSON.stringify(sub));
    oldsubcategory = JSON.parse(JSON.stringify(sub));

    txtSubcategory.value = subcategory.name;


    fillCombo(cmbCategory1, "", categories, "name", subcategory.categoryId.name);

    setStyle2(valid);
}


function getUpdates() {

    var updates = "";

    if(subcategory!=null && oldsubcategory!=null) {
        if (subcategory.name != oldsubcategory.name)
            updates = updates + "\nSubcategory Name is Changed";

        if (subcategory.categoryId.name != oldsubcategory.categoryId.name)
            updates = updates + "\nCategory is Changed";
    }

    return updates;

}

function btnUpdateMC() {
    var errors = getErrors2();
    if (errors == "") {
        var updates = getUpdates();
        if (updates == "")
            swal({
                title: 'Nothing Updated..!',icon: "warning",
                text: '\n',
                button: false,
                timer: 1200});
        else {
            swal({
                title: "Are you sure to update following Subcategory details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/subcategory", "PUT", subcategory);
                    if (response == "0") {
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Your work has been Done \n Update SuccessFully..!',
                            text: '\n',
                            button: false,
                            timer: 1200
                        });
                        $(document).ready(function(){
                            if($('#chkClose').prop("checked") == true){
                                loadForm2();
                            }else if($('#chkClose').prop("checked") == false){
                                $('#formmodal').modal('hide');
                                loadForm();
                            }
                        });
                        loadSearchedTable2();

                    }
                    else swal({
                        title: 'Update not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true,
                        closeOnClickOutside: false,
                    });
                }
            });
        }
    }
    else
        swal({
            title: 'You have following errors in your form',icon: "error",
            text: '\n '+getErrors2(),
            button: true,
        });

}

function btnDeleteMC2(sub) {
    subcategory = JSON.parse(JSON.stringify(sub));

    swal({
        title: "Are you sure to delete following Subcategory...?",
        text :  "\nSub Category Name : " + subcategory.name +
            "\nCategory : " + subcategory.categoryId.name,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/subcategory","DELETE",subcategory);
            if (responce==0) {
                swal({
                    title: "Deleted Successfully....!",
                    text: "\n\n  Status change to delete",
                    icon: "success",
                    button: false,
                    timer: 1200,
                });
                loadForm2();
                loadSearchedTable2();
            } else {
                swal({
                    title: "You have following erros....!",
                    text: "\n\n" + responce,
                    icon: "error",
                    button: true,
                    closeOnClickOutside: false,
                });
            }
        }
    });

}


function loadSearchedTable2() {

    var searchtext = txtSearchsubname.value;

    var query ="&searchtext=";

    if(searchtext!="")
        query = "&searchtext=" + searchtext;
    //window.alert(query);
    loadTable2(activepage, cmbPagesize2.value, query);

}

function btnSubSearchMC(){
    activepage=1;
    loadSearchedTable2();
}

function btnSubSearchClearMC(){
    loadView();
}

function btnPrintTableMC2(subcategory) {

    var newwindow=window.open();
    formattab = tblSubcategory.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Subcategory Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(sind) {
    cindex = sind;

    var sprop = tblSubcategory.firstChild.firstChild.children[cindex].getAttribute('property');

    if(sprop.indexOf('.') == -1) {
        subcategories.sort(
            function (a, b) {
                if (a[sprop] < b[sprop]) {
                    return -1;
                } else if (a[sprop] > b[sprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        subcategories.sort(
            function (a, b) {
                if (a[sprop.substring(0,sprop.indexOf('.'))][sprop.substr(sprop.indexOf('.')+1)] < b[sprop.substring(0,sprop.indexOf('.'))][sprop.substr(sprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[sprop.substring(0,sprop.indexOf('.'))][sprop.substr(sprop.indexOf('.')+1)] > b[sprop.substring(0,sprop.indexOf('.'))][sprop.substr(sprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblSubcategory',subcategories,fillForm,btnDeleteMC2,null);
    clearSelection(tblSubcategory);

    if(activerowno!="")selectRow(tblSubcategory,activerowno,active);

}












