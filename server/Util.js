// node modules
var fs = require('fs');
var glob = require('glob');

// Classes
var logger = new (require('./Logger.js'))();

class Util {
  constructor(){}

  /**
   * Loads & returns a given file.
   * @param {String} filePath - The path to a file.
   * @returns {Boolean|String}
   */
  loadFile(filePath){
    var fileContents = fs.readFileSync(filePath, 'utf8', function(){
      logger.errorMsg( "Couldn't load file - "+ filePath );
      return false;
    });

    return fileContents;
  }

  /**
   * Loads & returns the contents of a folder.
   * @param {String} dirPath - The path to a file.
   * @returns {Boolean|Array}
   */
  loadDir(dirPath){
    var files = fs.readdirSync(dirPath, function(){
      logger.errorMsg( "Couldn't read from directory - "+ dirPath );
      return false;
    });

    return files;
  }

  /**
   * Removes a file from the filesystem. This method makes the operation synchronous
   * and outputs logs if something goes wrong during the operation.
   * @param {String} file - The path to the file that will be removed.
   * @returns {Boolean}
   */
  unlink(file){
    try{
      fs.unlinkSync(file);
      logger.errorMsg(file, 'Deleted');
      return true;
    }catch(err){
      logger.errorMsg( err.message, 'Delete' );
      return false;
    }
  }

  /**
   * Renames a file from the filesystem. This method makes the operation synchronous
   * and outputs logs if something goes wrong during the operation.
   * @param {String} oldName - The path to the file that will be renamed.
   * @param {String} newName - The path to the file with it's new name.
   * @returns {Boolean}
   */
  rename(oldName, newName){
    try{
      fs.renameSync(oldName, newName);
      logger.successMsg(oldName+' to '+newName, 'Renamed');
      return true;
    }catch(err){
      logger.errorMsg( err.message, 'Rename' );
      return false;
    }
  }

  /**
   * Writes a file to the filesystem. This method makes the operation synchronous
   * and outputs logs if something goes wrong during the operation.
   * @param {String} path - The path to the file that will be written.
   * @param {String} content - The contents of the file.
   * @returns {Boolean}
   */
  writeFile(path, content){
    try{
      fs.writeFileSync(path, content);
      logger.successMsg(path, 'Wrote');
      return true;
    }catch(err){
      logger.errorMsg( err.message, 'Write' );
      return false;
    }
  }

  /**
   * Checks a file on the filesystem. This method makes the operation synchronous
   * and outputs logs if something goes wrong during the operation.
   * @param {String} path - The path to the file that will be checked.
   * @returns {Boolean|Object}
   */
  statFile(path){
    try{
      var stat = fs.statSync(path);
      logger.successMsg(path, 'Stat');
      return stat;
    }catch(err){
      logger.errorMsg( err.message, 'Stat' );
      return false;
    }
  }

  /**
   * JSON pretty-print.
   *
   * @param {String} json - The JSON data, pre-encoded
   * @param {String} istr - The indentation string
   * @returns {String}
   */
  jsonpp(json, istr='  '){
    return JSON.stringify(JSON.parse(json), null, istr);
  }

  /**
   * Gives you a list of files within a directory.
   * @param {String} dir - The path that you want to get the contents of.
   * @param {Boolean} globPattern - Whether or not to use glob.
   * @param {String} filter - A regex pattern allowing for filtering down of glob results.
   * @returns {Array}
   */
  getFilesFrom(filePattern='', globPattern=false, filter=null){
    var filesResult = ( globPattern ) ? glob.sync(filePattern) : this.loadDir(filePattern);
    var files = [];

    for( var i=0; i<filesResult.length; i++ ){
      var file = filesResult[i];

      if( globPattern ){
        if( filter ){
          if( file.match( new RegExp(filter) ) ){
            files.push(file);
          }
        }else{
          files.push(file);
        }

      }else{
        files.push({
          name: file,
          path: filePattern+file
        });
      }
    }

    return files;
  }

  /**
   * Uppercases the first letter of a given string
   * @param {String} str - The String that'll be transformed
   * @returns {String}
   */
  ucFirst(str){
    return ( str ) ? str.charAt(0).toUpperCase() + str.substring(1) : 'No String passed';
  }

  /**
   * A helper to generate a string of attributes for a DOM element
   * @param {Object} atts - An Object containing attributes.
   * @returns {String}
   * @private
   * @example
   * _attributesString({ 'class':'page is-admin', 'data-fu':'bar' })
   * // In template
   * <div {{attributes}}></div>
   * // outputs
   * <div class="page is-admin" data-fu="bar"></div>
   */
  attributesString(atts){
    var str = '';

    _.forOwn(atts, function(val, key){
      str += ' '+key+'="'+val+'"';
    });

    return str;
  }
}

module.exports = Util;