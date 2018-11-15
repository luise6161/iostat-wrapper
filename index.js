var spawn = require('child_process').spawn,
    EventEmitter = require('events').EventEmitter;

function Process(options) {
    options = options||["-x", "-m"];
    process.env.LANG="en_US.utf8"; //enforce en_US to avoid locale problem
  
    var emitter = new EventEmitter(),
        iostat  = spawn('iostat', options, {env: process.env}),
        fullData = "",
        error = null;
  
    iostat.stdout.on('data', function (data) {
        fullData += data.toString();
    });

    iostat.stderr.on('data', function (data) {
        error = new Error('Process error: '+ data.toString());
    });

    iostat.on('exit', function (code) {
        if(code == 0){
            emitter.emit('data', ToObject(fullData), null);
        } else {
            emitter.emit('data', fullData, error);
        }
    });
    
    return emitter;
}

function ConvertToArray(line) {
    return line.trim().split(/ +/);
}

function Extract(value, headers) {
    var result = {};
    headers.forEach((header, index)=>{ 
        result[header] = Number(value[index]);
    })
    return result;
} 

function Larger(a, b) {
    if(a>b) return a;
    else return b;
}

function ToObject(output) {
    var lines = output.split('\n');
    var linesNum = lines.length;
    var mode = 0; // Current reading. 1 as cpu, 2 as device
    var header = [], tmp = {}, result = [];
    var cpuCount = 0, deviceCount = 0, latest;

    for(i=0;i<=linesNum;i++) {
        line = lines[i];
        if(i >= linesNum || (mode > 0 && line.length <= 1)){
            if(tmp != {}) {
                if(mode == 1) {
                    cpuCount ++;
                    latest = Larger(cpuCount, deviceCount) - 1;
                    if(!result[latest]){
                        result[latest] = {}
                    }
                    result[latest].Cpu = tmp;
                } else if(mode == 2){
                    deviceCount ++;
                    latest = Larger(cpuCount, deviceCount) - 1;
                    if(!result[latest]){
                        result[latest] = {}
                    }
                    result[latest].Device = tmp;
                }
                tmp = {};
            }
            mode = 0;
            continue;
        }
        if(line.indexOf("avg-cpu") >= 0) {
            header = ConvertToArray(line).slice(1);
            mode = 1;
            continue;
        } else if(line.indexOf("Device") >= 0) {
            header = ConvertToArray(line).slice(1);
            mode = 2;
            continue;
        }

        if(mode == 1) {
            tmp = Extract(ConvertToArray(line), header);
        } else if(mode == 2) {
            let value = ConvertToArray(line);
            let key = value[0];
            var device = Extract(value.slice(1), header);
            tmp[key] = device;
        }
    }

    return result;
}

module.exports = {Process, ToObject};