var DRAGITEM = null;
/* VERSION 2 */

test("tree-container-1");
function test(id) {
    var ROOT = getRootForContainer(id);
    if (ROOT != null) {
        setDropAllowed(ROOT);
        var nodes = [
            { title: 'item 1', id: '1', childs: [] },
            { title: 'item 2', id: '2', childs: [{ title: 'sub item 2', id: '2-1', childs: [] }] }];
        convertToView(ROOT, nodes);
        convertToModel(ROOT);
    }
}

function getRootForContainer(id) {
    var cont = document.getElementById(id);
    if (cont != null) {
        var roots = cont.getElementsByClassName("tree-root");
        for (var i = 0; i < roots.length; i++) {
            if (roots[i].parentElement == cont) {
                return roots[i];
            }
        }
    }
    return null;
}

function createNode(title, id, childs) {
    return { title: title, id: id, childs: childs };
}

function convertToModel(root) {
    var nodes = getNodesFromRoot(root);
    return nodes;
}

function selectNode(node) {
    //some action like a callback
}

function getNodesFromRoot(root) {
    var nodes = [];
    var htmlNodes = [];
    if (root.tagName == "UL") {
        var htmlNodes = root.getElementsByTagName('li');
    }
    if (root.tagName == "LI") {
        var htmlNodes = [];
        htmlNodes.push(root);
    }
    for (var i = 0; i < htmlNodes.length; i++) {
        var htmlNode = htmlNodes[i];
        if ((htmlNode.parentElement == root && root.tagName == "UL") || (htmlNode == root && root.tagName == "LI")) {
            var id = htmlNode.id;
            var title = htmlNode.getAttribute("data");
            var childs = [];
            var subNodes = htmlNode.getElementsByTagName('ul');
            for (var j = 0; j < subNodes.length; j++) {
                if (subNodes[j].parentElement == htmlNode) {
                    childs = getNodesFromRoot(subNodes[j]);
                }
            }
            nodes.push({ id: id, title: title, childs: childs });
        }
    }
    return nodes;
}

function convertToView(root, nodes) {
    if (root != null) {
        root.innerHTML = "";
        [].forEach.call(nodes, function (node) {
            addNode(node, root, false);
        });
    }
}

function addNode(node, parent, newID) {
    if (parent != null) {
        var htmlNode = document.createElement("li");
        htmlNode.id = node.id + newID ? "-1" : "";
        htmlNode.setAttribute("data", node.title);
        var hasNodes = (node.childs.length > 0);
        var myRoot = document.createElement("ul");
        htmlNode.appendChild(createHtmlNode(node, parent, function (checked) {
            myRoot.style.display = checked ? "block" : "none";
        }));
        htmlNode.appendChild(myRoot);
        parent.appendChild(htmlNode);
        if (hasNodes) {
            [].forEach.call(node.childs, function (node) {
                addNode(node, myRoot, newID);
            });
        }
        activeCheckbox(parent, true);
    }
}

function activeCheckbox(parent, value) {
    var p1 = parent;
    if (p1 != null) {
        var p2 = p1.parentElement;
        if (p2 != null) {
            var inputs = p2.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                if (input.parentElement != null && input.parentElement.parentElement == p2) {
                    input.disabled = !value;
                }
            }
        }
    }
}


function createHtmlNode(node, root, callback) {
    var box = document.createElement("input");
    box.type = "checkbox";
    box.checked = true;
    box.disabled = true;
    box.onchange = function () {
        callback(box.checked);
    };
    var label = document.createElement("label");
    label.className = "control control--checkbox";
    label.innerHTML = node.title;
    label.appendChild(box);
    label.setAttribute("root", root.parentElement.id);
    var control = document.createElement("div");
    control.className = "control__indicator";
    label.appendChild(control);
    label.onclick = function () {
        selectNode(node);
        setSelected(label, root);
    };
    //DRAG
    setDragAllowed(label);
    setDropAllowed(label);
    return label;
}

function setSelected(label, root) {
    if (label != null && root != null) {
        var nodes = root.getElementsByTagName("label");
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.remove("selected");
        }
        if (label != null) {
            label.classList.add("selected");
        }
    }
}

function setDropAllowed(node) {
    node.addEventListener('dragenter', handleDragEnter, false);
    node.addEventListener('dragover', handleDragOver, false);
    node.addEventListener('dragleave', handleDragLeave, false);
    node.addEventListener('drop', handleDrop, false);
}

function setDragAllowed(node) {
    node.draggable = true;
    node.addEventListener('dragstart', handleDragStart, false);
    node.addEventListener('dragend', handleDragEnd, false);
}

/* DRAG DROP */
function handleDragStart(e) {
    setSelected(null);
    e.target.parentElement.classList.add("dragged");
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: e.target.parentElement.id }));
    DRAGITEM = e.target.parentElement;
}

function handleDragEnd(e) {
    e.target.parentElement.style.opacity = '1';
    e.target.parentElement.classList.remove("dragged");
    var root = getRootForContainer(e.target.getAttribute("root"));
    removeAllStylesFromNode(root);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this.id == "tree-root") {
        this.classList.add('over');
    } else {
        this.parentElement.classList.add('over');
    }
}

function handleDragLeave(e) {
    if (this.id == "tree-root") {
        this.classList.remove('over');
    } else {
        this.parentElement.classList.remove('over');
    }
}

function removeAllStylesFromNode(root) {
    if (root != null) {
        var nodes = root.getElementsByTagName("li");
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.remove("over");
        }
    }
}

function handleDrop(e) {

    if (e.stopPropagation) {
        e.stopPropagation();
    }
    //var src = JSON.parse(e.dataTransfer.getData('text'));
    var src = DRAGITEM;
    if (src != null) {
        var copy = false;
        if (src == e.target.parentElement) {
            copy = true;
        }
        var element = src;
        dropNode(element, e.target.parentElement, copy);
    }
    DRAGITEM = null;
    return false;
}

function dropNode(element, target, copy) {
    var cloned = element.cloneNode(true);
    cloned.id = cloned.id + "-1";
    if (!copy) { removeNode(element); }
    var nodes = getNodesFromRoot(cloned);
    var targets = getNodesFromRoot(target);
    if (targets.length > 0) {
        targets[0].childs.push(nodes);
    }
    appender = getNodesAppender(target);
    if (appender != null) {
        console.log("append: ");
        console.log(cloned);
        console.log(" to ");
        console.log(target);
        [].forEach.call(nodes, function (node) {
            addNode(node, appender, true);
        });
    }
}

function checkHasParent(root) {
    var appender = getNodesAppender(root);
    if (appender != null) {
        var items = appender.getElementsByTagName("li");
        if (items.length == 0) {
            var inputs = root.getElementsByTagName("input");
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                if (input.parentElement != null && input.parentElement.parentElement == root) {
                    input.disabled = true;
                }
            }
        }
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.parentElement == root) {
                activeCheckbox(item, true);
            }
        }
    }
}

function removeNode(element) {
    var parent = element.parentNode;
    if (parent != null) {
        if (parent.id !== "tree-root") {
            console.log("remove from ");
            console.log(parent2);
            parent.removeChild(element);
            var parent2 = parent.parentNode;
            if (parent2 != null) {
                checkHasParent(parent2);
            }
        } else {
            console.log("remove");
            console.log(element);
            console.log("from");
            console.log(parent);
            parent.removeChild(element);
        }
    }
}

function getNodesAppender(root) {
    var appenders = root.getElementsByTagName("ul");
    console.log("find appender for ");
    console.log(root);
    for (var i = 0; i < appenders.length; i++) {
        if (appenders[i].parentElement == root) {
            return appenders[i];
        }
    }
    return null;
}
