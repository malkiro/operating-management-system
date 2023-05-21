window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);

    privilages = httpRequest("../privilage?module=ITEM","GET");

    //Data services for Combo Boxes
    categories = httpRequest("../category/list","GET");
    employeecreated = httpRequest("../employee/list","GET");


    valid = "3px solid green";
    invalid = "3px solid red";
    initial = "3px solid #d6d6c2";
    updated = "3px solid #ff9900";
    active = "#ff9900";

    loadForm();
    loadView();
    disableButtons(false, true, true);

}

function loadView() {

    //Search Area
    txtSearchname.value="";
    txtSearchname.style.background = "";

    //Table Area
    activerowno = "";
    activepage = 1;
    var query = "&searchtext=";
    loadTable(1,cmbPagesize.value,query);
}

function loadTable(page,size,query) {
    page = page - 1;
    brands = new Array();
    var data = httpRequest("/brand/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) brands = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblBrand',brands,fillForm,btnDeleteMC,null);
    clearSelection(tblBrand);

    if(activerowno!="")selectRow(tblBrand,activerowno,active);

    if(brand != 0){
        for(var i =0; i< tblBrand.children[1].children.length; i++){
            tblBrand.children[1].children[i].lastChild.style.paddingLeft = "40px";
            tblBrand.children[1].children[i].lastChild.lastChild.style.display = "none";
        }
    }

}

function paginate(page) {
    var paginate;
    if(oldbrand==null){
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
        activerowno=""
        loadSearchedTable();
        loadForm();
    }

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Brand Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    brand = new Object();
    oldbrand = null;

    fillCombo(cmbCategory, "Select Category", categories, "name");

    fillCombo(cmbEmployee, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    brand.employeeId = JSON.parse(cmbEmployee.value);
    cmbEmployee.disabled="disabled";



    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteAddeddate.value=today.getFullYear()+"-"+month+"-"+date;
    brand.addeddate=dteAddeddate.value;
    dteAddeddate.disabled="disabled";

    $("#chkClose").prop("checked", false);

    txtBrand.value = "";
    cmbCategory.value = "";


    setStyle(initial);
    dteAddeddate.style.border=valid;
    cmbEmployee.style.border=valid;

    disableButtons(false, true, true);
}

function setStyle(style) {
    txtBrand.style.border = style;
    cmbCategory.style.border = style;
    dteAddeddate.style.border = style;
    cmbEmployee.style.border = style;
}


function disableButtons(add, upd, del) {

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


function getErrors() {

    var errors = "";
    addvalue = "";

    if (brand.name == null){
        errors = errors + "\n" + "Brand Name Not Enter";
        txtBrand.style.border = invalid;
    }
    else  addvalue = 1;

    if (brand.categoryId == null){
        errors = errors + "\n" + "Category Not Selected";
        cmbCategory.style.border = invalid;
    }

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
        title: "Are you sure to add following Brand...?" ,
        text :  "\nBrand Name : " + brand.name +
            "\nCategory : " + brand.categoryId.name +
            "\nCategory : " + brand.addeddate +
            "\nCategory : " + brand.employeeId.callingname,
        icon: "resourse/image/brandadd.png",
        buttons: [
            'No, Cancel',
            'Yes, Save!'
        ],
        closeOnClickOutside: false,

    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/brand", "POST", brand);
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
                        loadForm();
                        activerowno = 1;
                        loadSearchedTable();
                    }else if($('#chkClose').prop("checked") == false){
                        $('#formmodal').modal('hide');
                        loadForm();
                        activerowno = 1;
                        loadSearchedTable();
                    }
                });

            }
            else swal({
                title: 'Save not Success... , You have following errors', icon: "error",
                text: '\n ' + response,
                button: true,
                closeOnClickOutside: false

            });
        }
    });

}

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if(oldbrand == null && addvalue == ""){
        loadForm();
    }else{
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n" ,
            icon: "warning",
            buttons: [true, "Yes, Discard!"],
            dangerMode: true,
            closeOnClickOutside: false,

        }).then((willClear) => {
            if (willClear) {
                loadForm();
            }

        });
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(oldbrand==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, "Yes, Discard!"],
                dangerMode: true,
                closeOnClickOutside: false,

            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm();
                }else{

                }
            });
        }else{
            $('#formmodal').modal('hide');
            loadForm();
        }

    }
    else{
        if(getErrors()==''&&getUpdates()==''){
            $('#formmodal').modal('hide');
            loadForm();
        }else{
            swal({
                title: "Form has Some Update Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, "Yes, Discard!"],
                dangerMode: true,
                closeOnClickOutside: false,

            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm();
                }else{

                }
            });
        }
    }
}


function fillForm(brnd,rowno){
    activerowno = rowno;

    clearSelection(tblBrand);
    disableButtons(true, false, false);
    selectRow(tblBrand,activerowno,active);

    brand = JSON.parse(JSON.stringify(brnd));
    oldbrand = JSON.parse(JSON.stringify(brnd));

    txtBrand.value = brand.name;
    dteAddeddate.value = brand.addeddate;

    fillCombo(cmbCategory, "", categories, "name",brand.categoryId.name);
    fillCombo(cmbEmployee, "", employeecreated, "callingname",brand.employeeId.callingname);

    setStyle(valid);

}


function getUpdates() {

    var updates = "";

    if(brand!=null && oldbrand!=null) {

        if (brand.brandno != oldbrand.brandno)
            updates = updates + "\nBrand Name is Changed";

        if (brand.categoryId.name != oldbrand.categoryId.name)
            updates = updates + "\nCategory is Changed";
    }

    return updates;

}

function btnUpdateMC() {
    var errors = getErrors();
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
                title: "Are you sure to update following Brand details...?",
                text: "\n"+ getUpdates(),
                icon: "resourse/image/brandup.png",
                closeOnClickOutside: false,
                buttons: ['No, Cancel', 'Yes, Update!'],
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/brand", "PUT", brand);
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
                                loadForm();
                                loadSearchedTable();
                            }else if($('#chkClose').prop("checked") == false){
                                $('#formmodal').modal('hide');
                                loadForm();
                                loadSearchedTable();
                            }
                        });


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
            text: '\n '+getErrors(),
            button: true,
            closeOnClickOutside: false,
        });

}

function btnDeleteMC(brnd) {
    brand = JSON.parse(JSON.stringify(brnd));

    swal({
        title: "Are you sure to delete following Brand...?",
        text :  "\nBrand Name : " + brand.name +
            "\nCategory : " + brand.categoryId.name +
            "\nCategory : " + brand.addeddate +
            "\nCategory : " + brand.employeeId.callingname,
        icon: "resourse/image/branddel.png",
        buttons: ['No, Cancel', 'Yes, Delete it!'],
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/brand","DELETE",brand);
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

    var searchtext = txtSearchname.value;

    var query ="&searchtext=";

    if(searchtext!="")
        query = "&searchtext=" + searchtext;
    //window.alebrnd(query);
    loadTable(activepage, cmbPagesize.value, query);
    disableButtons(false, true, true);
}

function btnSearchMC(){
    activepage=1;
    loadSearchedTable();
}

function btnSearchClearMC(){
    loadView();
    disableButtons(false, true, true);
}

function btnPrintTableMC(brand) {

    var newwindow=window.open();
    formattab = tblBrand.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isobrnd{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Brand Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(bind) {
    cindex = bind;

    var bprop = tblBrand.firstChild.firstChild.children[cindex].getAttribute('property');

    if(bprop.indexOf('.') == -1) {
        brands.sort(
            function (a, b) {
                if (a[bprop] < b[bprop]) {
                    return -1;
                } else if (a[bprop] > b[bprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        brands.sort(
            function (a, b) {
                if (a[bprop.substring(0,bprop.indexOf('.'))][bprop.substr(bprop.indexOf('.')+1)] < b[bprop.substring(0,bprop.indexOf('.'))][bprop.substr(bprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[bprop.substring(0,bprop.indexOf('.'))][bprop.substr(bprop.indexOf('.')+1)] > b[bprop.substring(0,bprop.indexOf('.'))][bprop.substr(bprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblBrand',brands,fillForm,btnDeleteMC,null);
    clearSelection(tblBrand);
    disableButtons(false, true, true);

    if(activerowno!="")selectRow(tblBrand,activerowno,active);

}

