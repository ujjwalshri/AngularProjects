const app = angular.module('myMath', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'pages/home.html',
        controller: 'MainCtrl'
    })
    .when('/calculator', {
        templateUrl: 'pages/calculator.html',
        controller: 'MainCtrl',
        requiresAuth: true
    })
    .when('/length', {
        templateUrl: 'pages/length.html',
        controller: 'MainCtrl',
        requiresAuth: true
    })
    .when('/signup', {
        templateUrl: 'pages/signup.html',
        controller: 'SignupCtrl'
    })
    .when('/login', {
        templateUrl: 'pages/login.html',
        controller: 'loginCtrl'
    })
    .when('/baseConverter' , {
        templateUrl: 'pages/baseConverter.html',
        controller: 'MainCtrl',
    })
    .otherwise({
        redirectTo: '/'
    });
}]);

app.run(['$rootScope', '$location', function($rootScope, $location) {
    const loggedInUser = localStorage.getItem('loggedInUser');
        if(loggedInUser){
            $rootScope.loggedOut = false;
        }else{
            $rootScope.loggedOut = true;
        }
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        
        if (next.requiresAuth && !loggedInUser) {
            event.preventDefault();
            $location.path('/login');
        } else if ((next.originalPath === '/login' || next.originalPath === '/signup') && loggedInUser) {
            event.preventDefault();
            $location.path('/');
        }
    });
}]);

app.controller('MainCtrl', function($scope) {
    $scope.hi = 'Hello World!';
    $scope.logoutUser = ()=>{
        localStorage.removeItem('loggedInUser');
        window.location.href = '/#!/login';
        // reload window
         window.location.reload();
    }
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    $scope.username = loggedInUser ? loggedInUser.username : '';
});

let db;
const openDatabase = () => {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open('myMath', 2);
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            db.createObjectStore('users', { keyPath: 'username' });
        }
        request.onsuccess = (e) => {
            db = e.target.result;
            resolve("Database opened successfully");
        }
        request.onerror = (e) => {
            console.log('Error: ' + e.target.errorCode);
            reject(e);
        }
    });
}

app.controller('SignupCtrl', function($scope) {
    openDatabase().then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });

    $scope.handleSignup = function() {
        const username = $scope.username;
        const name = $scope.name;
        const password = $scope.password;

        if (!username || !name || !password) {
            alert('All fields are required!');
            return;
        }

        const user = {
            username: username,
            name: name,
            password: password
        };

        const transaction = db.transaction(['users'], 'readwrite');
        const objectStore = transaction.objectStore('users');
        const request = objectStore.add(user);

        request.onsuccess = function() {
            alert('User signed up successfully!');
            $scope.$apply(function() {
                $scope.username = '';
                $scope.name = '';
                $scope.password = '';
            });
        };

        request.onerror = function(e) {
            console.log('Error: ', e.target.errorCode);
            alert('Error signing up user!');
        };
    };
});

app.controller('loginCtrl', function($scope) {
    openDatabase().then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });

    $scope.handleLogin = function() {
        const username = $scope.loginUsername;
        const password = $scope.loginPassword;

        if (!username || !password) {
            alert('All fields are required!');
            return;
        }

        const transaction = db.transaction(['users'], 'readonly');
        const objectStore = transaction.objectStore('users');
        const request = objectStore.get(username);

        request.onsuccess = function() {
            const user = request.result;
            if (!user) {
                alert('User not found!');
                return;
            }

            if (user.password === password) {
                alert('User logged in successfully!');
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                window.location.href = '/#!/';
                // reload window
                window.location.reload();
            } else {
                alert('Incorrect password!');
            }
        };

        request.onerror = function(e) {
            console.log('Error: ', e.target.errorCode);
            alert('Error logging in user!');
        };
    };
});

app.controller('calculatorCtrl', function($scope) {
    $scope.expression = "0";
 
    $scope.evaluate = ()=>{
         for(let i=0; i<$scope.expression.length; i++){
             if($scope.expression[i] === 'x'){
                 $scope.expression = $scope.expression.replace('x', '*');
             }
         }
         $scope.expression = eval($scope.expression);
    }
    $scope.clear = ()=>{
          $scope.expression = "0";
    }
    $scope.back  = ()=>{
         $scope.expression = $scope.expression.slice(0, -1);
         if($scope.expression === ""){
             $scope.expression = "0";
         }
    }
     $scope.add = (value)=>{
           if($scope.expression === "0"){
                 $scope.expression = value;
           }else{
                 $scope.expression += value;
           }
     }
 });


app.controller('lengthCtrl', function($scope) {
    $scope.value = '';
    $scope.unit = '';
    $scope.outputUnit = '';
    $scope.convertedOutput = 0;

    $scope.conversionRates = {
        meters: 1,
        kilometers: 1000,
        miles: 1609.34,
        inches: 0.0254,
        feet: 0.3048,
        centimeters: 0.01,
        millimeters: 0.001
    };

    $scope.convert = () => {
        const inputUnit = $scope.unit.toLowerCase();
        const outputUnit = $scope.outputUnit.toLowerCase();
        console.log($scope.value);
        console.log(inputUnit);
        console.log(outputUnit);
        if (!$scope.value || !$scope.conversionRates[inputUnit] || !$scope.conversionRates[outputUnit]) {
            alert('Invalid unit or value. Use meters, kilometers, miles, inches, feet, centimeters, or millimeters.');
            return;
        }
        // Convert input value to meters, then to the output unit
        const valueInMeters = $scope.value * $scope.conversionRates[inputUnit];
        $scope.convertedOutput = Math.floor(valueInMeters / $scope.conversionRates[outputUnit]);
    };

    // Insert the new code block
    $scope.inputUnitOptions = Object.keys($scope.conversionRates);
    $scope.outputUnitOptions = Object.keys($scope.conversionRates);
});



app.controller('baseCtrl', function($scope) {
    const loggedInUser =  JSON.parse(localStorage.getItem('loggedInUser'));
    if(!loggedInUser){
        window.location.href = '/#!/login';
        
        return;
    }

    $scope.outputBase = '';
    $scope.inputBase= '';
    $scope.inputNumber = '';
    $scope.convertedOutput = '';
    $scope.outputBases = {
        binary: 2,
        octal: 8,
        decimal: 10,
        hexadecimal: 16
    }

    $scope.convert = () => {
       const inputBase = $scope.inputBase;
        const outputBase = $scope.outputBase;
        const inputNumber = $scope.inputNumber;
        console.log(inputNumber);
        console.log(outputBase);

        if (!inputBase || !outputBase) {
            alert('All fields are required!');
            return;
        }
        const decimalNumber = parseInt(inputNumber, inputBase); // converting any number to original decimal number first 
       
        $scope.convertedOutput = decimalNumber.toString(outputBase);//converting that number to the desired base
    };
});