# iostat-wrapper
Wrap iostat outputs into array of object.
## Introduction
Wrapper around [iostat]( http://sebastien.godard.pagesperso-orange.fr/man_iostat.html ) for Node,
providing 3 methods. Methods providing EventEmitter/Promise to get information, and an extra method only for data conversion.

### Methods

`RunIOStat(args)`: Run `iostat` and provide an EventEmitter to handle the output from `iostat`.

Data comes back as an event 'data'. You can bind the event like 
```js
    iostat.RunIOStat().on('data', (data, error)=>{
        console.log(data);
    });
```

`Process(args)`: Provide an Promise to wrap `RunIOStat` method. This is to facilitate the use of `.then()` and `await`.

```js
    iostat.Process(['-x']).then(data => {
        console.log(data);
    })
```

`ToObject(rawOutput)`: Convert raw string output of `iostat` into array of objects. Returns an array.

### Data schema

As the returned value, `data` would be an Array of Objects of this kind of form :
```js
    [{ 
        Cpu: 
        { 
            '%user': 1.11,
            '%nice': 0.01,
            '%system': 1.11,
            '%iowait': 0.1,
            '%steal': 0,
            '%idle': 97.67 
        },
        Device: 
        { 
            'sda': 
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

The schema of `data` would be different according to the output of `iostat`. Only parameters in the returned table title of `iostat` cmdlet is included. 

`error` will give out the error message if there is anything wrong with running `iostat`.

If need to run iostat in continuous mode, like with arguments ['-x','-m','1','2'], you will recieve an array of 2 objects. For now, this package can only return converted value after the `iostat` process is over. That is to say, when you run `iostat` with args like ['-x', '1'], the wrapper cannot give you any return value but keep waiting.

Takes iostat arguments as an array, ['-x', '-m'] by default.
e.g : `iostat.RunIOStat(['-x','-m', '1','2'])` is to actually run `iostat -x -m 1 2`, and register an event emitter to return the output value after converted it into array of objects.

## Examples
```js
    var iostat = require('iostat-wrapper');
    iostat.RunIOStat(['-x','-m','1','2']).on('data', function(data, error) {
        console.log(stats);
        if (stats[0].Device.sda && stats[0].Device.sda["%util"] > 1)
            console("Too Heavy");
    });
```
```js
    var iostat = require('iostat-wrapper');
    var data = await iostat.Process(['-x','-m','1','2']);
    console.log(100 - data[1].Cpu['%idle']);
```