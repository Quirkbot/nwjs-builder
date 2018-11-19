
const { existsSync } = require('fs');
const cp = require('child_process');

const DecompressZip = require('decompress-zip');

function ExtractZip(path, destination, callback) {

    const unzip = new DecompressZip(path);
    unzip.on('error', (err) => callback(err))
    .on('extract', () => callback(null, destination))
    .extract({
        path: destination,
    });

};

describe('nwb', function() {

    describe('nwbuild -h', function() {

        this.timeout(30000);

        it('should print help and exit with code 0', function(done) {

            cp.exec('node ./bin/nwb.js nwbuild -h', function(err, stdout, stderr) {

                if(err) throw err;

                done();

            });

        });

    });

    describe('nwbuild', function() {

        this.timeout(900000);

        it('should build in "./temp/build/" as .zip', function(done) {

            cp.exec('node ./bin/nwb.js nwbuild -v 0.14.4-sdk -p win32,linux32,osx64 --output-dir "./temp/build/" --output-name "{name}-v{version}-{target}" --output-format ZIP ./assets/nwb-test/', function(err, stdout, stderr) {

                console.log(stdout);
                console.error(stderr);

                if(err) throw err;

                if(!existsSync('./temp/build/nwb-test-v0.0.1-win-ia32.zip')) throw new Error('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-v0.0.1-linux-ia32.zip')) throw new Error('ERROR_FILE_NOT_EXISTS');
                if(!existsSync('./temp/build/nwb-test-v0.0.1-osx-x64.zip')) throw new Error('ERROR_FILE_NOT_EXISTS');

                done();

            });

        });

        if(process.platform == 'win32') {

            it('should launch and exit with code 233 (win32)', function(done) {

                ExtractZip('./temp/build/nwb-test-v0.0.1-win-ia32.zip', './temp/build/nwb-test-v0.0.1-win-ia32/', (err, destination) => {

                    if(err) throw err;

                    cp.exec('.\\temp\\build\\nwb-test-v0.0.1-win-ia32\\nwb-test.exe 233', {}, (err, stdout, stderr) => {

                        if(err && err.code == 233) return done();
                        else if(err) throw err;
                        else throw new Error('ERROR_EXIT_CODE_UNEXPECTED');

                    });

                });

            });

        }
        else if(process.platform == 'linux') {

            it('should launch and exit with code 233 (linux)', function(done) {

                ExtractZip('./temp/build/nwb-test-v0.0.1-linux-ia32.zip', './temp/build/nwb-test-v0.0.1-linux-ia32/', (err, destination) => {

                    if(err) throw err;

                    cp.exec('./temp/build/nwb-test-v0.0.1-linux-ia32/nwb-test 233', {}, (err, stdout, stderr) => {

                        if(err && err.code == 233) return done();
                        else if(err) throw err;
                        else throw new Error('ERROR_EXIT_CODE_UNEXPECTED');

                    });

                });

            });

        }
        else if(process.platform == 'darwin') {

            it('should decompress (darwin)', function(done) {

                ExtractZip('./temp/build/nwb-test-v0.0.1-osx-x64.zip', './temp/build/nwb-test-v0.0.1-osx-x64/', (err, destination) => {

                    if(err) throw err;

                    done();

                });

            });

        }

    });

    describe('nwbuild -r', function() {

        this.timeout(300000);

        it('should launch and exit with code 233', function(done) {

            cp.exec('node ./bin/nwb.js nwbuild -v 0.14.4-sdk -r --with-ffmpeg -- --remote-debugging-port=9222 ./assets/nwb-test/ 233', function(err, stdout, stderr) {

                console.log(stdout);
                console.error(stderr);

                if(err && err.code == 233) return done();
                else if(err) throw err;
                else throw new Error('ERROR_EXIT_CODE_UNEXPECTED');

            });

        });

    });

});
