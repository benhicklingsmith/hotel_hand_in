/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//========== localstorage management functions ============

function setObject(key, value) {
// puts an object into localstorage
    window.sessionStorage.setItem(key, JSON.stringify(value));
};

function getObject(key) {
// gets an object from localstorage
    var storage = window.sessionStorage;
	var value = storage.getItem(key);
    return value && JSON.parse(value);
};

function clearObject(key) {
// removes an object from localstorage
	//window.localStorage.clear(o);
        window.sessionStorage.removeItem(key);
};

function clearStorage() {
// removes everything placed in localstorage
	window.sessionStorage.clear();
};

