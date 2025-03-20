window.logoutUser = function() {
    localStorage.removeItem('krishiMitraLoggedIn');
    localStorage.removeItem('krishiMitraUserName');
    localStorage.removeItem('krishiMitraMobile');
    localStorage.removeItem('krishiMitraAadhaar');
    window.location.href = 'login.html';
}