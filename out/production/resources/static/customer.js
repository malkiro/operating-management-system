window.addEventListener("load", initialize);

//Initializing Functions

function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);
    cmbCType.addEventListener("change",disableField);

    privilages = httpRequest("../privilage?module=CUSTOMER","GET");

    //Data services for Combo Boxes
    ctypes = httpRequest("../ctype/list","GET");
    croutes = httpRequest("../distributionroute/list","GET");
    activecroutes = httpRequest("../distributionroute/activelist","GET");
    customerstatuses = httpRequest("../cstatus/list","GET");
    employeecreated = httpRequest("../employee/list","GET");


    valid = "3px solid green";
    invalid = "3px solid red";
    initial = "3px solid #d6d6c2";
    updated = "3px solid #ff9900";
    active = "#ff9900";

    loadForm();
    loadView();
    disableButtons(false, true, true);
    selectDeleteRow();
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
    customers = new Array();
    var data = httpRequest("/customer/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) customers = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblCustomer',customers,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblCustomer);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblCustomer,activerowno,active);

}


function selectDeleteRow() {
    for(index in customers){
        if(customers[index].cstatusId.name =="Deleted"){
            tblCustomer.children[1].children[index].style.color = "#f00";
            tblCustomer.children[1].children[index].style.fontWeight = "bold";
            tblCustomer.children[1].children[index].lastChild.children[1].disabled = true;
            tblCustomer.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(oldcustomer==null){
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

function viewitem(cus,rowno) {

    customer = JSON.parse(JSON.stringify(cus));

    tbCNumber.innerHTML = customer.regno;
    tbCType.innerHTML =  customer.ctypeId.name;
    tbCname.innerHTML = customer.cname;
    tbCmobile.innerHTML = customer.cmobile;
    if (customer.ctypeId.id ==1 || customer.ctypeId.id ==2) {
        tbCland.innerHTML = customer.cland;
    }else {
        tbCland.innerHTML = customer.cnic;
    }
    if (customer.distributionrouteId != null){
        tbRoute.innerHTML =  customer.distributionrouteId.routename;
    }else{
        tbRoute.innerHTML = "";
    }
    tbCemail.innerHTML = customer.cemail;
    tbAddress.innerHTML =  customer.address;
    tbCdescription.innerHTML = customer.cdescription;
    tbCPname.innerHTML = customer.cpname;
    tbCPmobile.innerHTML = customer.cpmobile;
    tbCPnic.innerHTML =  customer.cpnic;
    tbCPemail.innerHTML =  customer.cpemail;
    tbPoint.innerHTML =  customer.point;
    tbTobepaid.innerHTML =  toDecimal(customer.tobepaid,2);
    tbCreditlimt.innerHTML =  toDecimal(customer.maxcreditlimt,2);
    tbCustomerstatus.innerHTML = customer.cstatusId.name;
    tbDORegister.innerHTML = customer.regdate;
    tbEmployeeCreated.innerHTML = customer.employeeId.callingname;

}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Customer Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    customer = new Object();
    oldcustomer = null;
    fillCombo(cmbCType, "Select Customer Type", ctypes, "name");

    fillCombo(cmbCroute, "Select Distribution Route", activecroutes, "routename");

    fillCombo(cmbCustomerstatus, "", customerstatuses, "name", "Active");
    customer.cstatusId = JSON.parse(cmbCustomerstatus.value);

    fillCombo(cmbEmployeeCreated, "", employeecreated, "callingname",session.getObject('activeuser').employeeId.callingname);
    customer.employeeId = JSON.parse(cmbEmployeeCreated.value);
    cmbEmployeeCreated.disabled="disabled";
    cmbCType.removeAttribute("disabled", "disabled");


    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteDORegister.value=today.getFullYear()+"-"+month+"-"+date;
    customer.regdate=dteDORegister.value;
    dteDORegister.disabled="disabled";

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/customer/nextnumber", "GET");
    txtCNumber.value = nextNumber.regno;
    customer.regno = txtCNumber.value;
    txtCNumber.disabled="disabled";

    Creditlimit.style.display = "none";
    Tobepaid.style.display = "none";
    Point.style.display = "none";

    cmbCustomerstatus.setAttribute("disabled", "disabled");
    $("#chkClose").prop("checked", false);

    txtCname.value = "";
    txtCmobile.value = "";
    txtCland.value = "";
    txtNIC.value = "";
    txtCemail.value = "";
    txtAddress.value = "";
    txtCdescription.value = "";
    txtCPname.value = "";
    txtCPmobile.value = "";
    txtCPnic.value = "";
    txtCPemail.value = "";

    spnCname.style.visibility="hidden";
    spnCmobile.style.visibility="hidden";
    spnRoute.style.visibility="hidden";
    spnAddress.style.visibility="hidden";
    spnCPname.style.visibility="hidden";
    spnCPnic.style.visibility="hidden";
    spnCPnic.style.visibility="hidden";

    setStyle(initial);
    txtCNumber.style.border=valid;
    cmbCustomerstatus.style.border=valid;
    dteDORegister.style.border=valid;
    cmbEmployeeCreated.style.border=valid;


    fieldCP.setAttribute("disabled","disabled");
    fieldCustomer.setAttribute("disabled","disabled");

    disableButtons(false, true, true);

}


function setStyle(style) {
    txtCNumber.style.border = style;
    cmbCType.style.border = style;
    txtCname.style.border = style;
    txtCmobile.style.border = style;
    txtCland.style.border = style;
    txtNIC.style.border = style;
    cmbCroute.style.border = style;
    txtCemail.style.border = style;
    txtAddress.style.border = style;
    txtCdescription.style.border = style;
    txtCPname.style.border = style;
    txtCPmobile.style.border = style;
    txtCPnic.style.border = style;
    txtCPemail.style.border = style;
    dteDORegister.style.border = style;
    cmbCustomerstatus.style.border = style;
    cmbEmployeeCreated.style.border = style;
    //span

    hpCname.style.borderRight=style;
    hpCname.style.borderTop=style;
    hpCname.style.borderBottom=style;

    hpCPname.style.borderRight=style;
    hpCPname.style.borderTop=style;
    hpCPname.style.borderBottom=style;


    hpCmobile.style.borderRight=style;
    hpCmobile.style.borderTop=style;
    hpCmobile.style.borderBottom=style;


    hpNIC.style.borderRight=style;
    hpNIC.style.borderTop=style;
    hpNIC.style.borderBottom=style;


    hpCPnic.style.borderRight=style;
    hpCPnic.style.borderTop=style;
    hpCPnic.style.borderBottom=style;

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

function disableField() {
    txtCreditlimit.value = toDecimal(customer.ctypeId.creditlimit);
    customer.maxcreditlimt = txtCreditlimit.value;

    if(customer.ctypeId.id ==1 || customer.ctypeId.id ==2){
        fieldCP.removeAttribute("disabled","disabled");
        fieldCustomer.removeAttribute("disabled","disabled");
        spnCname.style.visibility="visible";
        spnCmobile.style.visibility="visible";
        spnRoute.style.visibility="visible";
        spnAddress.style.visibility="visible";
        spnCPname.style.visibility="visible";
        spnCPnic.style.visibility="visible";

        nicField.style.display = "none";
        landField.style.display = "inline";

    }
    else {
        fieldCP.setAttribute("disabled","disabled");
        fieldCustomer.removeAttribute("disabled","disabled");
        spnCname.style.visibility="visible";
        spnCmobile.style.visibility="visible";
        spnAddress.style.visibility="visible";
        spnCPname.style.visibility="hidden";
        spnCPnic.style.visibility="hidden";
        spnRoute.style.visibility="hidden";

        nicField.style.display = "inline";
        landField.style.display = "none";
    }
}

function getErrors() {

    var errors = "";
    addvalue = "";

    if (customer.ctypeId == null) {
        errors = errors + "\n" + "Customer Type Not Selected";
        cmbCType.style.border = invalid;
    }
    else {
        if(customer.ctypeId.id ==1 || customer.ctypeId.id ==2){
            // setStyle2(initial);
            if (customer.cname == null){
                errors = errors + "\n" + "Customer Name Not Enter";
                txtCname.style.border=invalid;
                hpCname.style.borderRight=invalid;
                hpCname.style.borderTop=invalid;
                hpCname.style.borderBottom=invalid;
            }
            else  addvalue = 1;

            if (customer.cmobile == null){
                errors = errors + "\n" + "Customer Mobile Not Enter";
                txtCmobile.style.border=invalid;
                hpCmobile.style.borderRight=invalid;
                hpCmobile.style.borderTop=invalid;
                hpCmobile.style.borderBottom=invalid;
            }
            else  addvalue = 1;

            if (customer.distributionrouteId == null){
                errors = errors + "\n" + "Distribution Route Not Enter";
                cmbCroute.style.border=invalid;
            }
            else  addvalue = 1;

            if (customer.address == null) {
                errors = errors + "\n" + "Customer Address Not Enter";
                txtAddress.style.border = invalid;
            }
            else  addvalue = 1;

            if (customer.cpname == null) {
                errors = errors + "\n" + "Contact Person Name Not Enter";
                txtCPname.style.border = invalid;
                hpCPname.style.borderRight=invalid;
                hpCPname.style.borderTop=invalid;
                hpCPname.style.borderBottom=invalid;
            }
            else  addvalue = 1;

            if (customer.cpnic == null) {
                errors = errors + "\n" + "Contact Person NIC Not Enter";
                txtCPnic.style.border = invalid;
                hpCPnic.style.borderRight=invalid;
                hpCPnic.style.borderTop=invalid;
                hpCPnic.style.borderBottom=invalid;
            }
            else  addvalue = 1;

        }
        function setStyle2(style) {
            txtCPnic.style.border = style;
            cmbCroute.style.border = style;
            txtCPemail.style.border = style;
        }

        if(customer.ctypeId.id ==3){
            setStyle2(initial);

            if (customer.cname == null){
                errors = errors + "\n" + "Customer Name Not Enter";
                txtCname.style.border=invalid;
                hpCname.style.borderRight=invalid;
                hpCname.style.borderTop=invalid;
                hpCname.style.borderBottom=invalid;
            }
            else  addvalue = 1;

            if (customer.cmobile == null){
                errors = errors + "\n" + "Customer Mobile Not Enter";
                txtCmobile.style.border=invalid;
                hpCmobile.style.borderRight=invalid;
                hpCmobile.style.borderTop=invalid;
                hpCmobile.style.borderBottom=invalid;
            }
            else  addvalue = 1;

            if (customer.cnic == null){
                errors = errors + "\n" + "Customer NIC Not Enter";
                txtNIC.style.border=invalid;
                hpNIC.style.borderRight=invalid;
                hpNIC.style.borderTop=invalid;
                hpNIC.style.borderBottom=invalid;
            }
            else  addvalue = 1;

            if (customer.address == null) {
                errors = errors + "\n" + "Customer Address Not Enter";
                txtAddress.style.border = invalid;
            }
            else  addvalue = 1;

        }

    }

    return errors;

}

function btnAddMC(){
    console.log(customer);
    if(getErrors()==""){
        if(txtCland.value=="" ||txtCemail.value=="" || txtCdescription.value =="" || txtCPname.value=="" ||txtCPmobile.value=="" || txtCPnic.value =="" || txtCPemail.value ==""){
            swal({
                title: "Are you sure to continue...?",
                text: "Form has some empty fields.....",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            }).then((willAdd) => {
                if (willAdd) {
                    savedata();
                }
            });

        }else{
            savedata();
        }
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

    if(customer.ctypeId.id ==1 || customer.ctypeId.id ==2){
        swal({
            title: "Are you sure to add following Customer...?" ,
            text :"\nNumber : " + customer.regno +
                "\nCustomer Type : " + customer.ctypeId.name+
                "\nCustomer Name : " + customer.cname +
                "\nMobile : " + customer.cmobile +
                "\nRoute : " + customer.distributionrouteId.routename +
                "\nAddress : " + customer.address +
                "\nContact Person Name : " + customer.cpname +
                "\nContact Person NIC : " + customer.cpnic +
                "\nReg Date : " + customer.regdate +
                "\nCustomer Status : " + customer.cstatusId.name +
                "\nAdded By : " + customer.employeeId.callingname,
            icon: "warning",
            buttons: true,
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willAdd) => {
            if (willAdd) {
                var response = httpRequest("/customer", "POST", customer);
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

    if(customer.ctypeId.id ==3){
        swal({
            title: "Are you sure to add following Customer...?" ,
            text :"\nNumber : " + customer.regno +
                "\nCustomer Type : " + customer.ctypeId.name+
                "\nCustomer Name : " + customer.cname +
                "\nMobile : " + customer.cmobile +
                "\nNIC : " + customer.cnic +
                "\nAddress : " + customer.address +
                "\nReg Date : " + customer.regdate +
                "\nCustomer Status : " + customer.cstatusId.name +
                "\nAdded By : " + customer.employeeId.callingname,
            icon: "warning",
            buttons: true,
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willAdd) => {
            if (willAdd) {
                var response = httpRequest("/customer", "POST", customer);
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

}


function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if(oldcustomer == null && addvalue == ""){
        loadForm();
        selectDeleteRow();
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
                selectDeleteRow();
            }

        });
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(oldcustomer==null){
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
                    selectDeleteRow();
                }else{

                }
            });
        }else{
            $('#formmodal').modal('hide');
            loadForm();
            selectDeleteRow();
        }

    }
    else{
        if(getErrors()==''&&getUpdates()==''){
            $('#formmodal').modal('hide');
            loadForm();
            selectDeleteRow();
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
                    selectDeleteRow();
                }else{

                }
            });
        }
    }
}

function fillForm(cus,rowno){
    activerowno = rowno;

    clearSelection(tblCustomer);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblCustomer,activerowno,active);

    customer = JSON.parse(JSON.stringify(cus));
    oldcustomer = JSON.parse(JSON.stringify(cus));

    cmbCustomerstatus.removeAttribute("disabled", "disabled");
    Creditlimit.style.display = "block";
    Tobepaid.style.display = "block";
    Point.style.display = "block";


    txtCNumber.value = customer.regno;
    txtCname.value = customer.cname;
    txtCmobile.value = customer.cmobile;
    txtCland.value = customer.cland;
    txtNIC.value = customer.cnic;
    txtCemail.value = customer.cemail;
    txtAddress.value = customer.address;
    txtCdescription.value = customer.cdescription;
    txtCPname.value = customer.cpname;
    txtCPmobile.value = customer.cpmobile;
    txtCPnic.value = customer.cpnic;
    txtCPemail.value = customer.cpemail;
    dteDORegister.value = customer.regdate;

    txtCreditlimit.value  = toDecimal(customer.maxcreditlimt,2);
    txtTobepaid.value  = toDecimal(customer.tobepaid,2);
    txtPoint.value = customer.point;
    txtCreditlimit.style.border = valid;
    txtTobepaid.style.border = valid;
    txtPoint.style.border = valid;
    txtTobepaid.disabled = true;
    txtPoint.disabled = true;

    txtCNumber.disabled="disabled";
    cmbCType.disabled="disabled";

    fillCombo(cmbCType, "Select Customer Type", ctypes, "name", customer.ctypeId.name);
    fillCombo(cmbCustomerstatus, "", customerstatuses, "name",customer.cstatusId.name);
    fillCombo(cmbEmployeeCreated, "", employeecreated, "callingname",customer.employeeId.callingname);

    if(customer.ctypeId.id ==1 || customer.ctypeId.id ==2){
        fieldCP.removeAttribute("disabled","disabled");
        fieldCustomer.removeAttribute("disabled","disabled");
        spnCname.style.visibility="visible";
        spnCmobile.style.visibility="visible";
        spnRoute.style.visibility="visible";
        spnAddress.style.visibility="visible";
        spnCPname.style.visibility="visible";
        spnCPnic.style.visibility="visible";

        nicField.style.display = "none";
        landField.style.display = "inline";

    }else {
        fieldCP.setAttribute("disabled","disabled");
        fieldCustomer.removeAttribute("disabled","disabled");
        spnCname.style.visibility="visible";
        spnCmobile.style.visibility="visible";
        spnAddress.style.visibility="visible";
        spnCPname.style.visibility="hidden";
        spnCPnic.style.visibility="hidden";
        spnRoute.style.visibility="hidden";

        nicField.style.display = "inline";
        landField.style.display = "none";
    }


    setStyle(valid);

    croutes = httpRequest("../distributionroute/list","GET");
    if (customer.distributionrouteId == null) {
            fillCombo(cmbCroute, "Select Distribution Route", croutes, "routename");
            cmbCroute.style.border = initial;
        }else{
            fillCombo(cmbCroute, "", croutes, "routename", customer.distributionrouteId.routename);
            cmbCroute.style.border = valid;
        }

    if (customer.cland == null) {
        txtCland.style.border = initial;
    }

    if (customer.cemail == null) {
        txtCemail.style.border = initial;
    }

    if (customer.cdescription == null) {
        txtCdescription.style.border = initial;
    }

    if (customer.cpname == null) {
        txtCPname.style.border = initial;
        hpCPname.style.border = initial;
    }

    if (customer.cpmobile == null) {
        txtCPmobile.style.border = initial;
    }

    if (customer.cpnic == null) {
        txtCPnic.style.border = initial;
        hpCPnic.style.border = initial;
    }

    if (customer.cpemail == null) {
        txtCPemail.style.border = initial;
    }

}


function getUpdates() {

    var updates = "";

    if(customer!=null && oldcustomer!=null) {

        if(customer.ctypeId.id ==1 || customer.ctypeId.id ==2){
            if (customer.distributionrouteId.routename != oldcustomer.distributionrouteId.routename)
                updates = updates + "\nCustomer Distribution Route is Changed";
        }
        if (customer.ctypeId.name != oldcustomer.ctypeId.name)
            updates = updates + "\nCustomer Type is Changed";


        if (customer.cname != oldcustomer.cname)
            updates = updates + "\nCustomer Fullname Name is Changed";

        if (customer.cmobile != oldcustomer.cmobile)
            updates = updates + "\nCustomer Mobile is Changed";

        if (customer.cland != oldcustomer.cland)
            updates = updates + "\nCustomer Land is Changed";

        if (customer.cnic != oldcustomer.cnic)
            updates = updates + "\nCustomer NIC is Changed";

        if (customer.cemail != oldcustomer.cemail)
            updates = updates + "\nCustomer Email is Changed";

        if (customer.address != oldcustomer.address)
            updates = updates + "\nDelivery Address is Changed";

        if (customer.cdescription != oldcustomer.cdescription)
            updates = updates + "\nCustomer Description is Changed";

        if (customer.cpname != oldcustomer.cpname)
            updates = updates + "\nContact Person Name is Changed";

        if (customer.cpmobile != oldcustomer.cpmobile)
            updates = updates + "\nContact Person Mobile is Changed";

        if (customer.cpnic != oldcustomer.cpnic)
            updates = updates + "\nContact Person NIC is Changed";

        if (customer.cpemail != oldcustomer.cpemail)
            updates = updates + "\nContact Person NIC is Changed";

        if (customer.cstatusId.name != oldcustomer.cstatusId.name)
            updates = updates + "\nCustomer Status is Changed";
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
                title: "Are you sure to update following customer details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/customer", "PUT", customer);
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
        });

}

function btnDeleteMC(cus) {
    customer = JSON.parse(JSON.stringify(cus));

    swal({
        title: "Are you sure to delete following Customer...?",
        text :"\nNumber : " + customer.regno +
            "\nCustomer Type : " + customer.ctypeId.name+
            "\nCustomer Name : " + customer.cname +
            "\nMobile : " + customer.cmobile +
            "\nAddress : " + customer.address +
            "\nReg Date : " + customer.regdate +
            "\nCustomer Status : " + customer.cstatusId.name +
            "\nAdded By : " + customer.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/customer","DELETE",customer);
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
    //window.alert(query);
    loadTable(activepage, cmbPagesize.value, query);
    disableButtons(false, true, true);
    selectDeleteRow();

}

function btnSearchMC(){
    activepage=1;
    loadSearchedTable();
}

function btnSearchClearMC(){
    loadView();
}


function btnPrintTableMC(customer) {

    var newwindow=window.open();
    formattab = tblCustomer.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Customer Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(cind) {
    cindex = cind;

    var cprop = tblCustomer.firstChild.firstChild.children[cindex].getAttribute('property');

    if(cprop.indexOf('.') == -1) {
        customers.sort(
            function (a, b) {
                if (a[cprop] < b[cprop]) {
                    return -1;
                } else if (a[cprop] > b[cprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        customers.sort(
            function (a, b) {
                if (a[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)] < b[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)] > b[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblCustomer',customers,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblCustomer);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblCustomer,activerowno,active);



}

