window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup", btnSearchMC);

    privilages = httpRequest("../privilage?module=CUSTOMERPOINT", "GET");

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
    txtSearchname.value = "";
    txtSearchname.style.background = "";

    //Table Area
    activerowno = "";
    activepage = 1;
    var query = "&searchtext=";
    loadTable(1, cmbPagesize.value, query);
}

function loadTable(page, size, query) {
    page = page - 1;
    customerpoints = new Array();
    var data = httpRequest("/customerpoint/findAll?page=" + page + "&size=" + size + query, "GET");
    if (data.content != undefined) customerpoints = data.content;
    createPagination('pagination', data.totalPages, data.number + 1, paginate);
    fillTable('tblCustomerpoint', customerpoints, fillForm, btnDeleteMC, viewitem);
    clearSelection(tblCustomerpoint);

    if (activerowno != "") selectRow(tblCustomerpoint, activerowno, active);

}

function paginate(page) {
    var paginate;
    if (oldcustomerpoint == null) {
        paginate = true;
    } else {
        if (getErrors() == '' && getUpdates() == '') {
            paginate = true;
        } else {
            paginate = window.confirm("Form has Some Errors or Update Values. " +
                "Are you sure to discard that changes ?");
        }
    }
    if (paginate) {
        activepage = page;
        activerowno = ""
        loadSearchedTable();
        loadForm();
    }

}

function viewitem(cusp, rowno) {

    customerpoint = JSON.parse(JSON.stringify(cusp));

    tbName.innerHTML = customerpoint.name;
    tbStartrate.innerHTML = customerpoint.startrate;
    tbEndrate.innerHTML = customerpoint.endrate;
    tbPoint.innerHTML = customerpoint.pointperinvoice;
    tbInvoice.innerHTML = toDecimal(customerpoint.invoiceamount,2);
    tbDiscount.innerHTML = customerpoint.discountratio+"%";

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Customer Point Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () {
        printwindow.print();
    }, 100);
}

function loadForm() {
    customerpoint = new Object();
    oldcustomerpoint = null;

    $("#chkClose").prop("checked", false);

    txtName.value = "";
    txtStartrate.value = "";
    txtEndrate.value = "";
    txtDiscount.value = "";
    txtPoint.value = "";
    txtInvoice.value = "";

    setStyle(initial);

    disableButtons(false, true, true);
}

function setStyle(style) {
    txtName.style.border = style;
    txtStartrate.style.border = style;
    txtEndrate.style.border = style;
    txtDiscount.style.border = style;
    txtPoint.style.border = style;
    txtInvoice.style.border = style;

}

function disableButtons(add, upd, del) {

    if (add || !privilages.add) {
        btnAdd.setAttribute("disabled", "disabled");
        $('#btnAdd').css('cursor', 'not-allowed');
    } else {
        btnAdd.removeAttribute("disabled");
        $('#btnAdd').css('cursor', 'pointer')
    }

    if (upd || !privilages.update) {
        btnUpdate.setAttribute("disabled", "disabled");
        $('#btnUpdate').css('cursor', 'not-allowed');
    } else {
        btnUpdate.removeAttribute("disabled");
        $('#btnUpdate').css('cursor', 'pointer');
    }

    if (!privilages.update) {
        $(".buttonup").prop('disabled', true);
        $(".buttonup").css('cursor', 'not-allowed');
    } else {
        $(".buttonup").removeAttr("disabled");
        $(".buttonup").css('cursor', 'pointer');
    }

    if (!privilages.delete) {
        $(".buttondel").prop('disabled', true);
        $(".buttondel").css('cursor', 'not-allowed');
    } else {
        $(".buttondel").removeAttr("disabled");
        $(".buttondel").css('cursor', 'pointer');
    }

}


function getErrors() {
    var errors = "";
    addvalue = "";

    if (customerpoint.name == null){
        errors = errors + "\n" + "Name Not Enter";
        txtName.style.border = invalid;
    }
    else addvalue = 1;

    if (customerpoint.startrate == null){
        errors = errors + "\n" + "Start Point Rate Not Enter";
        txtStartrate.style.border = invalid;
    }
    else addvalue = 1;

    if (customerpoint.endrate == null){
        errors = errors + "\n" + "End Point Rate Not Enter";
        txtEndrate.style.border = invalid;
    }
    else addvalue = 1;

    if (customerpoint.pointperinvoice == null){
        errors = errors + "\n" + "Point Per Invoice Not Enter";
        txtPoint.style.border = invalid;
    }
    else addvalue = 1;

    if (customerpoint.invoiceamount == null){
        errors = errors + "\n" + "Invoice Amount Not Enter";
        txtInvoice.style.border = invalid;
    }
    else addvalue = 1;

    if (customerpoint.discountratio == null){
        errors = errors + "\n" + "Discounted Ratio Not Enter";
        txtDiscount.style.border = invalid;
    }
    else addvalue = 1;

    return errors;

}

function btnAddMC() {

    if (getErrors() == "") {
            savedata();
    } else {
        swal({
            title: "You have following errors",
            text: "\n" + getErrors(),
            icon: "error",
            button: true,
        });

    }
}

function savedata() {
    swal({
        title: "Are you sure to add following Customer Point...?",
        text: "\nName  : " + customerpoint.name +
            "\nStart Point Rate : " + customerpoint.startrate +
            "\nEnd Point Rate : " + customerpoint.endrate +
            "\nPoint Per Invoice : " + customerpoint.pointperinvoice +
            "\nInvoice Amount (Rs)  : " + customerpoint.invoiceamount +
            "\nDiscounted Ratio : " + customerpoint.discountratio,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willAdd) => {
        if(willAdd) {
            var response = httpRequest("/customerpoint", "POST", customerpoint);
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
                    }else if($('#chkClose').prop("checked") == false){
                        $('#formmodal').modal('hide');
                        loadForm();
                    }
                });
                activerowno = 1;
                loadSearchedTable();
            } else swal({
                title: 'Save not Success... , You have following errors', icon: "error",
                text: '\n ' + response,
                button: true
            });
        }
    }
)
    ;

}

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if (oldcustomerpoint == null && addvalue == "") {
        loadForm();
    } else {
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n",
            icon: "warning", buttons: true, dangerMode: true,
        }).then((willClear) => {
            if(willClear) {
                loadForm();
            }

        }
    )
        ;

    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(oldcustomerpoint==null){
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
                buttons: [true, " Yes ! Discard"],
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


function fillForm(cusp, rowno) {
    activerowno = rowno;

    clearSelection(tblCustomerpoint);
    disableButtons(true, false, false);
    selectRow(tblCustomerpoint,activerowno,active);

    customerpoint = JSON.parse(JSON.stringify(cusp));
    oldcustomerpoint = JSON.parse(JSON.stringify(cusp));

    txtName.value = customerpoint.name;
    txtStartrate.value = customerpoint.startrate;
    txtEndrate.value = customerpoint.endrate;
    txtDiscount.value = customerpoint.discountratio;
    txtPoint.value = customerpoint.pointperinvoice;
    txtInvoice.value = customerpoint.invoiceamount;

    setStyle(valid);

}


function getUpdates() {

    var updates = "";

    if (customerpoint != null && oldcustomerpoint != null) {
        if (customerpoint.name != oldcustomerpoint.name)
            updates = updates + "\nName is Changed";

        if (customerpoint.startrate != oldcustomerpoint.startrate)
            updates = updates + "\nStart Point Rate is Changed";

        if (customerpoint.endrate != oldcustomerpoint.endrate)
            updates = updates + "\nEnd Point Rate is Changed";

        if (customerpoint.pointperinvoice != oldcustomerpoint.pointperinvoice)
            updates = updates + "\nPoint Per Invoice is Changed";

        if (customerpoint.invoiceamount != oldcustomerpoint.invoiceamount)
            updates = updates + "\nInvoice Amount is Changed";

        if (customerpoint.discountratio != oldcustomerpoint.discountratio)
            updates = updates + "\nDiscounted Ratio is Changed";
    }

    return updates;

}

function btnUpdateMC() {
    var errors = getErrors();
    if (errors == "") {
        var updates = getUpdates();
        if (updates == "")
            swal({
                title: 'Nothing Updated..!', icon: "warning",
                text: '\n',
                button: false,
                timer: 1200
            });
        else {
            swal({
                title: "Are you sure to update following Customer Point details...?",
                text: "\n" + getUpdates(),
                icon: "warning", buttons: true, dangerMode: true,
            })
                .then((willUpdate) => {
                if(willUpdate) {
                    var response = httpRequest("/customerpoint", "PUT", customerpoint);
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
                            }else if($('#chkClose').prop("checked") == false){
                                $('#formmodal').modal('hide');
                                loadForm();
                            }
                        });
                        loadSearchedTable();

                    } else swal({
                        title: 'Update not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true
                    });
                }
            }
        )
            ;
        }
    } else
        swal({
            title: 'You have following errors in your form', icon: "error",
            text: '\n ' + getErrors(),
            button: true
        });

}

function btnDeleteMC(cusp) {
    customerpoint = JSON.parse(JSON.stringify(cusp));

    swal({
        title: "Are you sure to delete following Customer Point...?",
        text: "\nName  : " + customerpoint.name +
            "\nStart Point Rate : " + customerpoint.startrate +
            "\nEnd Point Rate : " + customerpoint.endrate +
            "\nPoint Per Invoice : " + customerpoint.pointperinvoice +
            "\nInvoice Amount (Rs)  : " + customerpoint.invoiceamount +
            "\nDiscounted Ratio : " + customerpoint.discountratio,
        icon: "warning", buttons: true, dangerMode: true,
    }).then((willDelete) => {
        if(willDelete) {
            var responce = httpRequest("/customerpoint", "DELETE", customerpoint);
            if (responce == 0) {
                swal({
                    title: "Deleted Successfully....!",
                    text: "\n\n  Status change to delete",
                    icon: "success", button: false, timer: 1200,
                });
                loadForm();
                loadSearchedTable();
            } else {
                swal({
                    title: "You have following erros....!",
                    text: "\n\n" + responce,
                    icon: "error", button: true,
                });
            }
        }
    }
)
    ;

}

function loadSearchedTable() {

    var searchtext = txtSearchname.value;

    var query = "&searchtext=";

    if (searchtext != "")
        query = "&searchtext=" + searchtext;
    //window.alert(query);
    loadTable(activepage, cmbPagesize.value, query);

}

function btnSearchMC() {
    activepage = 1;
    loadSearchedTable();
}

function btnSearchClearMC(){
    loadView();
}

function btnPrintTableMC(customerpoint) {

    var newwindow = window.open();
    formattab = tblCustomerpoint.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Customer Point Details : </h1></div>" +
        "<div>" + formattab + "</div>" +
        "</body>" +
        "</html>");
    setTimeout(function () {
        newwindow.print();
        newwindow.close();
    }, 100);
}

function sortTable(cpind) {
    cindex = cpind;

    var cpprop = tblCustomerpoint.firstChild.firstChild.children[cindex].getAttribute('property');

    if (cpprop.indexOf('.') == -1) {
        customerpoints.sort(
            function (a, b) {
                if (a[cpprop] < b[cpprop]) {
                    return -1;
                } else if (a[cpprop] > b[cpprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    } else {
        customerpoints.sort(
            function (a, b) {
                if (a[cpprop.substring(0, cpprop.indexOf('.'))][cpprop.substr(cpprop.indexOf('.') + 1)] < b[cpprop.substring(0, cpprop.indexOf('.'))][cpprop.substr(cpprop.indexOf('.') + 1)]) {
                    return -1;
                } else if (a[cpprop.substring(0, cpprop.indexOf('.'))][cpprop.substr(cpprop.indexOf('.') + 1)] > b[cpprop.substring(0, cpprop.indexOf('.'))][cpprop.substr(cpprop.indexOf('.') + 1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblCustomerpoint', customerpoints, fillForm, btnDeleteMC, viewitem);
    clearSelection(tblCustomerpoint);

    if (activerowno != "") selectRow(tblCustomerpoint, activerowno, active);


}

