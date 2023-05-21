window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);
    txtSize.addEventListener("keyup",txtSizeKU);
    cmbCategory.addEventListener("change",cmbCategoryCH);
    cmbBrand.addEventListener("change",cmbBrandCH);
    cmbSubcategory.addEventListener("change",cmbSubcategoryCH);

    privilages = httpRequest("../privilage?module=ITEM","GET");

    //Data services for Combo Boxes
    categories = httpRequest("../category/list","GET");
    brands = httpRequest("../brand/list","GET");
    subcategoies = httpRequest("../subcategory/list","GET");
    unittypes = httpRequest("../unittype/list","GET");
    itemstatuses = httpRequest("../itemstatus/list","GET");
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
    items = new Array();
    var data = httpRequest("/item/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) items = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblItem',items,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblItem);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblItem,activerowno,active);

}

function selectDeleteRow() {
    for(index in items){
        if(items[index].itemstatusId.name =="Deleted"){
            tblItem.children[1].children[index].style.color = "#f00";
            tblItem.children[1].children[index].style.fontWeight = "bold";
            tblItem.children[1].children[index].lastChild.children[1].disabled = true;
            tblItem.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(olditem==null){
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

function viewitem(itm,rowno) {

    item = JSON.parse(JSON.stringify(itm));

    tbCode.innerHTML = item.itemcode;
    tbCategory.innerHTML =  item.brandId.categoryId.name;
    tbBrand.innerHTML = item.brandId.name;
    tbSubcategory.innerHTML = item.subcategoryId.name;
    tbName.innerHTML = item.itemname;
    if(item.photo != null)
        imgitem.src =  atob(item.photo);
    else
        imgitem.src =  'resourse/image/noimage.png';
    tbUnittype.innerHTML = item.unittypeId.name;
    tbSize.innerHTML =  item.itemsize+"g";
    tbRop.innerHTML = item.rop;
    tbRoq.innerHTML = item.roq;
    tbRemarks.innerHTML = item.description;
    tbItemstatus.innerHTML = item.itemstatusId.name;
    tbDOAdded.innerHTML = item.date;
    tbEmployeeAdded.innerHTML = item.employeeId.callingname;

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Item Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    item = new Object();
    olditem = null;

    fillCombo(cmbCategory, "Select Category", categories, "name");
    fillCombo(cmbBrand, "Select Brand", brands, "name");
    fillCombo(cmbSubcategory, "Select Subcategory", subcategoies, "name");
    fillCombo(cmbUnittype, "Select Unittype", unittypes, "name");

    fillCombo(cmbItemstatus, "", itemstatuses, "name", "Active");
    item.itemstatusId = JSON.parse(cmbItemstatus.value);

    fillCombo(cmbEmployeeAdded, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    item.employeeId = JSON.parse(cmbEmployeeAdded.value);
    cmbEmployeeAdded.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteDOAdded.value=today.getFullYear()+"-"+month+"-"+date;
    item.date=dteDOAdded.value;
    dteDOAdded.disabled="disabled";

    cmbItemstatus.setAttribute("disabled", "disabled");
    $("#chkClose").prop("checked", false);

    txtCode.value = "";
    txtName.value = "";
    txtSize.value = "";
    txtRop.value = "";
    txtRoq.value = "";
    txtDescription.value = "";

    cmbBrand.disabled = true;
    cmbSubcategory.disabled = true;
    txtSize.disabled = true;
    txtName.disabled = false;

    setDefaultFile('flePhoto', item.photo);
    // removeFile('flePhoto');

    setStyle(initial);
    cmbItemstatus.style.border=valid;
    dteDOAdded.style.border=valid;
    cmbEmployeeAdded.style.border=valid;

    disableButtons(false, true, true);
}

function setStyle(style) {
    txtCode.style.border = style;
    cmbCategory.style.border = style;
    cmbBrand.style.border = style;
    cmbSubcategory.style.border = style;
    txtName.style.border = style;
    cmbUnittype.style.border = style;
    txtSize.style.border = style;
    txtRop.style.border = style;
    txtRoq.style.border = style;
    photoField.style.border = style;
    fldDescription.style.border = style;
    cmbItemstatus.style.border = style;
    dteDOAdded.style.border = style;
    cmbEmployeeAdded.style.border = style;
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

function cmbCategoryCH() {
    //get brand list by given cateory
    brands = httpRequest("../brand/listbycategory?categoryid="+JSON.parse(cmbCategory.value).id,"GET");
    fillCombo(cmbBrand, "Select Brand", brands, "name");

    //get subcategory list by given cateory
    subcategoies = httpRequest("../subcategory/listbycategory?categoryid="+JSON.parse(cmbCategory.value).id,"GET");
    fillCombo(cmbSubcategory, "Select Subcategory", subcategoies, "name");

    cmbBrand.disabled = false;
    cmbSubcategory.disabled = false;
    txtSize.disabled = false;

    if(olditem != null && olditem.brandId.categoryId.id !=JSON.parse(cmbCategory.value).id ){
        cmbCategory.style.border = updated;
        cmbBrand.style.border = initial;
        cmbSubcategory.style.border = initial;
        txtSize.style.border = initial;
        txtSize.value = "";
        txtName.style.border = initial;
        txtName.value = "";
    }else {
        cmbCategory.style.border=valid;
        cmbBrand.style.border = initial;
        cmbSubcategory.style.border = initial;
        txtSize.style.border = initial;
        txtSize.value = "";
        txtName.style.border = initial;
        txtName.value = "";
    }

}

function cmbBrandCH() {
    if(cmbCategory.value != "" && cmbSubcategory.value != "" && txtSize.value != ""){
        txtName.value = JSON.parse(cmbBrand.value).name+" "+ JSON.parse(cmbSubcategory.value).name+" "+txtSize.value+"g";
    }

    if(olditem != null && olditem.brandId.id !=JSON.parse(cmbBrand.value).id){
        cmbBrand.style.border = updated;
    }

    if (olditem != null){
        if(olditem.brandId.id ==JSON.parse(cmbBrand.value).id) {
                txtName.style.border=valid;
            }else {
                txtName.style.border=updated;
            }
        }

    }

function cmbSubcategoryCH() {
    if (cmbCategory.value != "" && cmbBrand.value != "" && txtSize.value != "") {
        txtName.value = JSON.parse(cmbBrand.value).name + " " + JSON.parse(cmbSubcategory.value).name + " " + txtSize.value + "g";
    }

    if(olditem != null && olditem.subcategoryId.id !=JSON.parse(cmbSubcategory.value).id ){
        cmbSubcategory.style.border = updated;
    }

    if (olditem != null){
        if(olditem.subcategoryId.id ==JSON.parse(cmbSubcategory.value).id) {
            txtName.style.border=valid;
        }else {
            txtName.style.border=updated;
        }
    }
}

function txtSizeKU() {
    txtName.value = JSON.parse(cmbBrand.value).name+" "+ JSON.parse(cmbSubcategory.value).name+" "+txtSize.value+"g";
    txtName.style.border=valid;
    txtName.disabled="disabled";
    item.itemname = txtName.value;

    // if(olditem.itemsize !=txtSize.value || olditem.brandId !=cmbBrand.value ||olditem.subcategoryId !=cmbSubcategory.value){
    //     txtName.style.border = updated;
    // }else {
    //     txtName.style.border=valid;
    // }

    if (olditem.itemsize ==txtSize.value) {
        txtName.style.border=valid;
    }else {
        txtName.style.border = updated;
    }
}



function getErrors() {

    var errors = "";
    addvalue = "";

    if (item.itemcode == null){
        errors = errors + "\n" + "Item Code Not Enter";
        txtCode.style.border = invalid;
    }
    else  addvalue = 1;

    if (cmbCategory.value == ""){
        errors = errors + "\n" + "Category Not Selected";
        cmbCategory.style.border = invalid;
    }
    else  addvalue = 1;

    if (item.brandId == null){
        errors = errors + "\n" + "Brand Not Selected";
        cmbBrand.style.border = invalid;
    }
    else  addvalue = 1;

    if (item.subcategoryId == null){
        errors = errors + "\n" + "Subcategory Not Selected";
        cmbSubcategory.style.border = invalid;
    }
    else  addvalue = 1;

    if (item.itemname == null){
        errors = errors + "\n" + "Item Name Not Enter";
        txtName.style.border = invalid;
    }
    else  addvalue = 1;

    if (item.unittypeId == null){
        errors = errors + "\n" + "Unittype Not Selected";
        cmbUnittype.style.border = invalid;
    }
    else  addvalue = 1;


    if (item.itemsize == null){
        errors = errors + "\n" + "Item Size Not Enter" +"\n";
        txtSize.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;

}

function btnAddMC(){

    console.log("1111", txtCode.value);
    console.log("2222", item.itemcode);

    if(getErrors()==""){
        if(txtRop.value=="" ||txtRoq.value=="" || txtDescription.value ==""){
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

    swal({
        title: "Are you sure to add following Item...?" ,
        text :  "\nItem Code : " + item.itemcode +
            "\nCategory : " + item.categoryId.name +
            "\nBrand  : " + item.brandId.name +
            "\nSubcategory  : " + item.subcategoryId.name +
            "\nItem Name  : " + item.itemname +
            "\nUnit Type : " + item.unittypeId.name +
            "\nSize  : " + item.itemsize +
            "\nRe-Order Point : " + item.rop +
            "\nRe-Order Qty : " + item.roq +
            "\nItem Status  : " + item.itemstatusId.name +
            "\nAdded Date : " + item.date +
            "\nAdded By : " + item.employeeId.callingname,
        icon: "resourse/image/item.png",
        buttons: [
            'No, Cancel',
            'Yes, Save!'
        ],
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/item", "POST", item);
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
                closeOnClickOutside: false,
            });
        }
    });

}

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if(olditem == null && addvalue == ""){
        loadForm();
        selectDeleteRow();
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
                selectDeleteRow();
            }

        });
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(olditem==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values or Update Values, \n Are you sure to discard that changes ? ",
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
                title: "Form has Some Values or Update Values, \n Are you sure to discard that changes ? ",
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



function fillForm(itm,rowno){
    activerowno = rowno;

    clearSelection(tblItem);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblItem,activerowno,active);

    item = JSON.parse(JSON.stringify(itm));
    olditem = JSON.parse(JSON.stringify(itm));


    cmbItemstatus.removeAttribute("disabled", "disabled");
    txtCode.value = item. itemcode;
    txtName.value = item.itemname;
    txtSize.value = item.itemsize;
    txtRop.value = item.rop;
    txtRoq.value = item.roq;
    txtDescription.value = item.description;
    dteDOAdded.value = item.date;

    cmbBrand.disabled = false;
    cmbSubcategory.disabled = false;
    txtSize.disabled = false;
    txtName.disabled = true;


    fillCombo(cmbCategory, "Select Category", categories, "name", item.subcategoryId.categoryId.name);

    brands = httpRequest("../brand/listbycategory?categoryid="+JSON.parse(cmbCategory.value).id,"GET");
    fillCombo(cmbBrand, "Select Brand", brands, "name", item.brandId.name);

    subcategoies = httpRequest("../subcategory/listbycategory?categoryid="+JSON.parse(cmbCategory.value).id,"GET");
    fillCombo(cmbSubcategory, "Select Subcategory", subcategoies, "name", item.subcategoryId.name);

    fillCombo(cmbUnittype, "Select Unittype", unittypes, "name", item.unittypeId.name);
    fillCombo(cmbItemstatus, "", itemstatuses, "name",item.itemstatusId.name);
    fillCombo(cmbEmployeeAdded, "", employeecreated, "callingname",item.employeeId.callingname);

    setDefaultFile('flePhoto', item.photo);

    if (item.photo != null) {
        photoField.style.border = valid;
    }else {
        photoField.style.border = initial;
    }

    setStyle(valid);

    if (item.rop == null) {
        txtRop.style.border = initial;
    }

    if (item.roq == null) {
        txtRoq.style.border = initial;
    }

    if (item.description == null) {
        fldDescription.style.border = initial;
    }

}



function getUpdates() {

    var updates = "";
    if(item!=null && olditem!=null) {

        if (item.itemcode != olditem.itemcode)
            updates = updates + "\nItem Code is Changed";

        if (olditem.brandId.categoryId.id !=JSON.parse(cmbCategory.value).id)
            updates = updates + "\nCategory is Changed";

        if (item.brandId.name != olditem.brandId.name)
            updates = updates + "\nBrand is Changed";

        if (item.subcategoryId.name != olditem.subcategoryId.name)
            updates = updates + "\nSubcategory is Changed";

        if (item.itemname !=olditem.itemname)
            updates = updates + "\nItem Name is Changed";

        if (item.unittypeId.name != olditem.unittypeId.name)
            updates = updates + "\nUnit Type is Changed";

        if (item.itemsize != olditem.itemsize)
            updates = updates + "\nSize is Changed";

        if (item.rop != olditem.rop)
            updates = updates + "\nRe-Order Point is Changed";

        if (item.roq != olditem.roq)
            updates = updates + "\nRe-Order Qty is Changed";

        if (item.photo != olditem.photo){
            updates = updates + "\nPhoto is Changed";
            photoField.style.border = updated;
        }

        if (item.description != olditem.description)
            updates = updates + "\nDescription is Changed";

        if (item.itemstatusId.name != olditem.itemstatusId.name)
            updates = updates + "\nItem Status is Changed";
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
                title: "Are you sure to update following Customer details...?",
                text: "\n"+ getUpdates(),
                icon: "resourse/image/itemup.png",
                buttons: ['No, Cancel', 'Yes, Update!'],
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/item", "PUT", item);
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
            }
            );
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

function btnDeleteMC(itm) {
    item = JSON.parse(JSON.stringify(itm));

    swal({
        title: "Are you sure to delete following Item...?",
        text :  "\nItem Code : " + item.itemcode +
            "\nCategory : " + item.subcategoryId.categoryId.name +
            "\nBrand  : " + item.brandId.name +
            "\nSubcategory  : " + item.subcategoryId.name +
            "\nItem Name  : " + item.itemname +
            "\nUnit Type : " + item.unittypeId.name +
            "\nSize  : " + item.itemsize +
            "\nRe-Order Point : " + item.rop +
            "\nRe-Order Qty : " + item.roq +
            "\nItem Status  : " + item.itemstatusId.name +
            "\nAdded Date : " + item.date +
            "\nAdded By : " + item.employeeId.callingname,
        icon: "resourse/image/itemdel.png",
        buttons: ['No, Cancel', 'Yes, Delete it!'],
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/item","DELETE",item);
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
    disableButtons(false, true, true);
    selectDeleteRow();
}

function btnPrintTableMC(item) {

    var newwindow=window.open();
    formattab = tblItem.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Item Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(itmind) {
    cindex = itmind;

    var iprop = tblItem.firstChild.firstChild.children[cindex].getAttribute('property');

    if(iprop.indexOf('.') == -1) {
        items.sort(
            function (a, b) {
                if (a[iprop] < b[iprop]) {
                    return -1;
                } else if (a[iprop] > b[iprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        items.sort(
            function (a, b) {
                if (a[iprop.substring(0,iprop.indexOf('.'))][iprop.substr(iprop.indexOf('.')+1)] < b[iprop.substring(0,iprop.indexOf('.'))][iprop.substr(iprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[iprop.substring(0,iprop.indexOf('.'))][iprop.substr(iprop.indexOf('.')+1)] > b[iprop.substring(0,iprop.indexOf('.'))][iprop.substr(iprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblItem',items,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblItem);
    disableButtons(false, true, true);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblItem,activerowno,active);

}

