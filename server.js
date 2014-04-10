
/*
Remember to open the port on your firewall :P 
    ptables -I INPUT -p tcp --dport PORT_INPUT -j ACCEPT



curl -X POST --data "android_id=ciao" http://127.0.0.1:8080

curl -X POST --data "android_id=ciao&exception='\'\''''select from dual " http://127.0.0.1:8080/exception


curl -X POST --data "android_id=ciao&page=asdasdasd'\'\''''select from dual" http://127.0.0.1:8080/page



ab -n 1000000 -c 5 -p post.data -T application/x-www-form-urlencoded "http://127.0.0.1:8080/page"


*/

/* enable console.log message */
var debugv = true;

/* listener port */
var port   = 8080;
/*listen host*/
var host   = "clshack.com";

/* import */
var mysql  = require('mysql');
var http   = require('http');
var util   = require('util');
var url    = require('url');
var qs     = require('querystring');

/* database configuration */
var db_config = {
    host     : '127.0.0.1',
    user     : 'android',
    password : '1993xaxaxa',
    database : 'ANDROID'
};

var pool = mysql.createPool(db_config);

/* function for display some usefull information in console */
function debugLog(msg){
    if(debugv)
        console.log(msg);
}

/* return array POST */
var parseRequest =  function (request,callback){
    var body = '';
    
    /*event data */
    request.on('data', function (data) {
        body += data;        
        /* 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB*/
        if (body.length > 1e6) { 
            /* FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST*/
            debugLog('dos from ' + ip);
            request.connection.destroy();
        }
    });
    
    /*at the end of data */
    request.on('end', function () {
        
        /*create array */
        var info = qs.parse(body);
        /*print some information*/
        debugLog(info);
        callback(info);
    });    
}

/* insert the client on the table TBUSERSTATS */
function inizializeClient(postdata){
    
    /*check if is not null. and the variable info is defined */
    if (typeof postdata !== 'undefined' && postdata['android_id'] !== '') {
        
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            
            var query = util.format('SELECT ID FROM TBUSERSTATS WHERE CONNECTED = CURDATE() AND ANDROID_ID = %s LIMIT 1',pool.escape(postdata['android_id']));
            
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                
                if ( rows.length == 0 ) {
                    /*insert the client */
                    query = util.format('INSERT INTO TBUSERSTATS(ANDROID_ID,CONNECTED,INFO,CONT) VALUES(%s,CURDATE(),%s,%d)',pool.escape(postdata['android_id']),pool.escape(postdata['info']),1);
                }
                else{
                    /*update the client */
                    query = util.format('UPDATE TBUSERSTATS SET CONT = CONT+1 WHERE ID = %d ',rows[0].ID);
                }
            
                debugLog(query);
            
                /* insert or update the client on database */
                connection.query(query, function(err, rows, fields) {
                    if (err) throw err;            
                });    
            
            });
            /* release connection */
            connection.release();
        });    
    }
}

/* insert the client on the table TBEXCEPTION */
function insertException(postdata){
    
    /*check if is not null. and the variable info is defined */
    if (typeof postdata !== 'undefined' && postdata['android_id'] !== '') {
        
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            
            var query = util.format('SELECT ID FROM TBUSERSTATS WHERE CONNECTED = CURDATE() AND ANDROID_ID = %s LIMIT 1',pool.escape(postdata['android_id']));
                        
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                
                if (rows.length !== 0 ){
                    query = util.format('INSERT INTO TBEXCEPTIONS(ID,EXCEPTIONS,CONT) VALUES(%d,%s,%d) ON DUPLICATE KEY UPDATE CONT=CONT+1',rows[0].ID,pool.escape(postdata['exception']),1);
                
                    debugLog(query);
                
                    /* insert or update the client on database */
                    connection.query(query, function(err2, rows2, fields2) {
                        if (err2) throw err2;            
                    });
                }
            });
            /* release connection */
            connection.release();
        });    
    }
}

/* insert the client on the table TBSTATS */
function insertSession(postdata){
    
    /*check if is not null. and the variable info is defined */
    if (typeof postdata !== 'undefined' && postdata['android_id'] !== '') {
        
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            
            var query = util.format('SELECT ID FROM TBUSERSTATS WHERE CONNECTED = CURDATE() AND ANDROID_ID = %s LIMIT 1',pool.escape(postdata['android_id']));
            
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                
                if (rows.length !== 0 ){
                    query = util.format('INSERT INTO TBSTATS(ID,PAGE,CONT) VALUES(%s,%s,%d) ON DUPLICATE KEY UPDATE CONT=CONT+1',rows[0].ID,pool.escape(postdata['page']),1);
                
                    debugLog(query);
                
                    /* insert or update the client on database */
                    connection.query(query, function(err2, rows2, fields2) {
                        if (err2) throw err2;
                    });
                }
            });
            /* release connection */
            connection.release();
        });    
    }
}

/* main server :D */
var server = http.createServer(function (req, res) {
    
    /* return always the ok 200 */
    res.writeHead(200, {"Content-Type": "text/plain"});
    
    /* if we have a request from android we have POST data with some information */
    if (req.method == 'POST') {
        
        var path = url.parse(req.url).pathname;  
            
        parseRequest(req,function(postdata){
            
            switch(path) {
                case '/':
                    inizializeClient(postdata);
                    res.write("index");
                    break;
                case '/exception':
                    insertException(postdata);
                    res.write("exception");
                    break;
                case '/page':
                    insertSession(postdata);
                    res.write("page");
                    break;
                default:
                    res.write("WTF");
            }

        });

    }
    res.end();
});
server.listen(port, host);
