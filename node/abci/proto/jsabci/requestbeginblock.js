/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

goog.provide('proto.types.RequestBeginBlock');

goog.require('jspb.BinaryReader');
goog.require('jspb.BinaryWriter');
goog.require('jspb.Message');
goog.require('proto.types.Evidence');
goog.require('proto.types.Header');
goog.require('proto.types.LastCommitInfo');


/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.types.RequestBeginBlock = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.types.RequestBeginBlock.repeatedFields_, null);
};
goog.inherits(proto.types.RequestBeginBlock, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.types.RequestBeginBlock.displayName = 'proto.types.RequestBeginBlock';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.types.RequestBeginBlock.repeatedFields_ = [4];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.types.RequestBeginBlock.prototype.toObject = function(opt_includeInstance) {
  return proto.types.RequestBeginBlock.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.types.RequestBeginBlock} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.types.RequestBeginBlock.toObject = function(includeInstance, msg) {
  var f, obj = {
    hash: msg.getHash_asB64(),
    header: (f = msg.getHeader()) && proto.types.Header.toObject(includeInstance, f),
    lastCommitInfo: (f = msg.getLastCommitInfo()) && proto.types.LastCommitInfo.toObject(includeInstance, f),
    byzantineValidatorsList: jspb.Message.toObjectList(msg.getByzantineValidatorsList(),
    proto.types.Evidence.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.types.RequestBeginBlock}
 */
proto.types.RequestBeginBlock.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.types.RequestBeginBlock;
  return proto.types.RequestBeginBlock.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.types.RequestBeginBlock} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.types.RequestBeginBlock}
 */
proto.types.RequestBeginBlock.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setHash(value);
      break;
    case 2:
      var value = new proto.types.Header;
      reader.readMessage(value,proto.types.Header.deserializeBinaryFromReader);
      msg.setHeader(value);
      break;
    case 3:
      var value = new proto.types.LastCommitInfo;
      reader.readMessage(value,proto.types.LastCommitInfo.deserializeBinaryFromReader);
      msg.setLastCommitInfo(value);
      break;
    case 4:
      var value = new proto.types.Evidence;
      reader.readMessage(value,proto.types.Evidence.deserializeBinaryFromReader);
      msg.addByzantineValidators(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.types.RequestBeginBlock.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.types.RequestBeginBlock.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.types.RequestBeginBlock} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.types.RequestBeginBlock.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getHeader();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.types.Header.serializeBinaryToWriter
    );
  }
  f = message.getLastCommitInfo();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.types.LastCommitInfo.serializeBinaryToWriter
    );
  }
  f = message.getByzantineValidatorsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.types.Evidence.serializeBinaryToWriter
    );
  }
};


/**
 * optional bytes hash = 1;
 * @return {string}
 */
proto.types.RequestBeginBlock.prototype.getHash = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes hash = 1;
 * This is a type-conversion wrapper around `getHash()`
 * @return {string}
 */
proto.types.RequestBeginBlock.prototype.getHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getHash()));
};


/**
 * optional bytes hash = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getHash()`
 * @return {!Uint8Array}
 */
proto.types.RequestBeginBlock.prototype.getHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getHash()));
};


/** @param {!(string|Uint8Array)} value */
proto.types.RequestBeginBlock.prototype.setHash = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional Header header = 2;
 * @return {?proto.types.Header}
 */
proto.types.RequestBeginBlock.prototype.getHeader = function() {
  return /** @type{?proto.types.Header} */ (
    jspb.Message.getWrapperField(this, proto.types.Header, 2));
};


/** @param {?proto.types.Header|undefined} value */
proto.types.RequestBeginBlock.prototype.setHeader = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.types.RequestBeginBlock.prototype.clearHeader = function() {
  this.setHeader(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.types.RequestBeginBlock.prototype.hasHeader = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional LastCommitInfo last_commit_info = 3;
 * @return {?proto.types.LastCommitInfo}
 */
proto.types.RequestBeginBlock.prototype.getLastCommitInfo = function() {
  return /** @type{?proto.types.LastCommitInfo} */ (
    jspb.Message.getWrapperField(this, proto.types.LastCommitInfo, 3));
};


/** @param {?proto.types.LastCommitInfo|undefined} value */
proto.types.RequestBeginBlock.prototype.setLastCommitInfo = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.types.RequestBeginBlock.prototype.clearLastCommitInfo = function() {
  this.setLastCommitInfo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.types.RequestBeginBlock.prototype.hasLastCommitInfo = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * repeated Evidence byzantine_validators = 4;
 * @return {!Array<!proto.types.Evidence>}
 */
proto.types.RequestBeginBlock.prototype.getByzantineValidatorsList = function() {
  return /** @type{!Array<!proto.types.Evidence>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.types.Evidence, 4));
};


/** @param {!Array<!proto.types.Evidence>} value */
proto.types.RequestBeginBlock.prototype.setByzantineValidatorsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.types.Evidence=} opt_value
 * @param {number=} opt_index
 * @return {!proto.types.Evidence}
 */
proto.types.RequestBeginBlock.prototype.addByzantineValidators = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.types.Evidence, opt_index);
};


proto.types.RequestBeginBlock.prototype.clearByzantineValidatorsList = function() {
  this.setByzantineValidatorsList([]);
};

