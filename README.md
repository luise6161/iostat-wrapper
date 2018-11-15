# iostat-wrapper
Wrap iostat outputs into array of object.
## Introduction
Wrapper around [iostat]( http://sebastien.godard.pagesperso-orange.fr/man_iostat.html ) for Node,
providing an EventEmitter to get information.

Provide 2 methods. 

`ToObject(rawOutput)`: Convert raw string output of iostat into array of objects. Return an array.

`Process(args)`: Provide an EventEmitter to handle the output from iostat.

Data comes back as an event 'data'. You can bind the event like 
```js
    iostat().Process().on('data', (data, error)=>{
        console.log(data);
    });
```

`data` is an Array of Object of this kind of form :
```json
    [{ 
        cpu: 
        { 
            '%user': 1.11,
            '%nice': 0.01,
            '%system': 1.11,
            '%iowait': 0.1,
            '%steal': 0,
            '%idle': 97.67 },
        devices: 
        { 
            sda: 
            { 
                'rrqm/s': 1.23,
                'wrqm/s': 1.23,
                'r/s': 1.23,
                'w/s': 1.23,
                'rMB/s': 1.23,
                'wMB/s': 1.23,
                'rsec/s': 123.4,
                'wsec/s': 123.4,
                'avgrq-sz': 12.3,
                'avgqu-sz': 0.12,
                'await': 12.34,
                '%util': 12.34
            } 
        } 
    }]
```

The schema of `data` will be different, according to the output of iostat.

`error` will give out the error message if there is anything wrong with running iostat.

If need to run iostat in continuous, like with arguments ['-x','-m','2']. You will recieve an array of 2 objects.

Takes an Array of iostat arguments as an array. Take ['-x', '-m'] by default.
e.g : iostat.Process(['-x','-m','2']);

## Example
```js
    var iostat = require('iostat-wrapper');
    iostat.Process(['-x','-m','2']).on('data', function(data, error) {
        console.log(stats);
        if (stats[0].devices.sda && stats[0].devices.sda["%util"] > 1)
            console("Too Heavy");
    });
```
