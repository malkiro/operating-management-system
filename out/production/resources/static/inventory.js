window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);

    privilages = httpRequest("../privilage?module=INVENTORY","GET");

    valid = "2px solid green";
    invalid = "2px solid red";
    initial = "2px solid #d6d6c2";
    updated = "2px solid #ff9900";
    active = "#ff9900";

    loadView();
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
    inventories = new Array();
    var data = httpRequest("/inventory/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) inventories = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblInventory',inventories,null,null,null);
    clearSelection(tblInventory);

    console.log(inventories[index].inventorystatusId.name);

    if(activerowno!="")selectRow(tblInventory,activerowno,active);

}

function paginate(page) {
    var paginate;
    oldinventory = null;

    if(oldinventory==null){
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
    }

}


function loadSearchedTable() {

    var searchtext = txtSearchname.value;

    var query ="&searchtext=";

    if(searchtext!="")
        query = "&searchtext=" + searchtext;
    //window.alert(query);
    loadTable(activepage, cmbPagesize.value, query);

}

function btnSearchMC(){
    activepage=1;
    loadSearchedTable();
}

function btnSearchClearMC(){
    loadView();
}

function btnPrintTableMC(inventory) {

    var newwindow=window.open();
    formattab = tblInventory.outerHTML;

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

function sortTable(invind) {
    cindex = invind;

    var invprop = tblInventory.firstChild.firstChild.children[cindex].getAttribute('property');

    if(invprop.indexOf('.') == -1) {
        inventories.sort(
            function (a, b) {
                if (a[invprop] < b[invprop]) {
                    return -1;
                } else if (a[invprop] > b[invprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        inventories.sort(
            function (a, b) {
                if (a[invprop.substring(0,invprop.indexOf('.'))][invprop.substr(invprop.indexOf('.')+1)] < b[invprop.substring(0,invprop.indexOf('.'))][invprop.substr(invprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[invprop.substring(0,invprop.indexOf('.'))][invprop.substr(invprop.indexOf('.')+1)] > b[invprop.substring(0,invprop.indexOf('.'))][invprop.substr(invprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblInventory',inventories,null,null,null);
    clearSelection(tblInventory);

    if(activerowno!="")selectRow(tblInventory,activerowno,active);



}

