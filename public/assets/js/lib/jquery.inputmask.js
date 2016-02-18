/*
 * Input Mask plugin for jquery
 * http://github.com/RobinHerbots/jquery.inputmask
 * Copyright (c) 2010 -	Robin Herbots
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 * Version: 0.0.0-dev
 */

(function(factory) {
		if (typeof define === "function" && define.amd) {
			define(["jquery", "inputmask"], factory);
		} else if (typeof exports === "object") {
			module.exports = factory(require("jquery"), require("./inputmask"));
		} else {
			factory(jQuery, window.Inputmask);
		}
	}
	(function($, Inputmask) {
		if ($.fn.inputmask === undefined) {
			//jquery plugin
			$.fn.inputmask = function(fn, options) {
				var nptmask, input;
				options = options || {};
				if (typeof fn === "string") {
					switch (fn) {
						case "mask":
							nptmask = new Inputmask(options);
							return this.each(function() {
								nptmask.mask(this);
							});
						case "unmaskedvalue":
							input = this.jquery && this.length > 0 ? this[0] : this;
							return input.inputmask ? input.inputmask.unmaskedvalue() : $(input).val();
						case "remove":
							return this.each(function() {
								if (this.inputmask) this.inputmask.remove();
							});
						case "getemptymask":
							input = this.jquery && this.length > 0 ? this[0] : this;
							return input.inputmask ? input.inputmask.getemptymask() : "";
						case "hasMaskedValue": //check wheter the returned value is masked or not; currently only works reliable when using jquery.val fn to retrieve the value
							input = this.jquery && this.length > 0 ? this[0] : this;
							return input.inputmask ? input.inputmask.hasMaskedValue() : false;
						case "isComplete":
							input = this.jquery && this.length > 0 ? this[0] : this;
							return input.inputmask ? input.inputmask.isComplete() : true;
						case "getmetadata": //return mask metadata if exists
							input = this.jquery && this.length > 0 ? this[0] : this;
							return input.inputmask ? input.inputmask.getmetadata() : undefined;
						case "setvalue":
							input = this.jquery && this.length > 0 ? this[0] : this;
							$(input).val(options);
							if (input.inputmask !== undefined) {
								$(input).triggerHandler("setvalue.inputmask");
							}
							break;
						case "option":
							if (typeof options === "string") {
								input = this.jquery && this.length > 0 ? this[0] : this;
								if (input.inputmask !== undefined) {
									return input.inputmask.option(options);
								}
							} else {
								return this.each(function() {
									if (this.inputmask !== undefined) {
										return this.inputmask.option(options);
									}
								});
							}
							break;
						default:
							options.alias = fn;
							nptmask = new Inputmask(options);
							return this.each(function() {
								nptmask.mask(this);
							});
					}
				} else if (typeof fn == "object") {
					nptmask = new Inputmask(fn);
					if (fn.mask === undefined && fn.alias === undefined) {
						return this.each(function() {
							if (this.inputmask !== undefined) {
								return this.inputmask.option(fn);
							} else nptmask.mask(this);
						});
					} else {
						return this.each(function() {
							nptmask.mask(this);
						});
					}
				} else if (fn === undefined) {
					//look for data-inputmask atributes
					return this.each(function() {
						nptmask = new Inputmask(options);
						nptmask.mask(this);
					});
				}
			};
		}
		return $.fn.inputmask;
	}));
/*
Input Mask plugin extensions
http://github.com/RobinHerbots/jquery.inputmask
Copyright (c) 2010 -  Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.0-dev

Optional extensions on the jquery.inputmask base
*/
(function(factory) {
		if (typeof define === "function" && define.amd) {
			define(["jquery", "inputmask"], factory);
		} else if (typeof exports === "object") {
			module.exports = factory(require("jquery"), require("./inputmask"));
		} else {
			factory(jQuery, window.Inputmask);
		}
	}
	(function($, Inputmask) {
		//number aliases
		Inputmask.extendAliases({
			"numeric": {
				mask: function(opts) {
					function autoEscape(txt) {
						var escapedTxt = "";
						for (var i = 0; i < txt.length; i++) {
							escapedTxt += opts.definitions[txt.charAt(i)] ? "\\" + txt.charAt(i) : txt.charAt(i);
						}
						return escapedTxt;
					}
					if (opts.repeat !== 0 && isNaN(opts.integerDigits)) {
						opts.integerDigits = opts.repeat;
					}
					opts.repeat = 0;
					if (opts.groupSeparator === opts.radixPoint) { //treat equal separator and radixpoint
						if (opts.radixPoint === ".") {
							opts.groupSeparator = ",";
						} else if (opts.radixPoint === ",") {
							opts.groupSeparator = ".";
						} else opts.groupSeparator = "";
					}
					if (opts.groupSeparator === " ") { //prevent conflict with default skipOptionalPartCharacter
						opts.skipOptionalPartCharacter = undefined;
					}
					opts.autoGroup = opts.autoGroup && opts.groupSeparator !== "";
					if (opts.autoGroup) {
						if (typeof opts.groupSize == "string" && isFinite(opts.groupSize)) opts.groupSize = parseInt(opts.groupSize);
						if (isFinite(opts.integerDigits)) {
							var seps = Math.floor(opts.integerDigits / opts.groupSize);
							var mod = opts.integerDigits % opts.groupSize;
							opts.integerDigits = parseInt(opts.integerDigits) + (mod === 0 ? seps - 1 : seps);
							if (opts.integerDigits < 1) {
								opts.integerDigits = "*";
							}
						}
					}

					//enforce placeholder to single
					if (opts.placeholder.length > 1) {
						opts.placeholder = opts.placeholder.charAt(0);
					}
					//only allow radixfocus when placeholder = 0
					opts.radixFocus = opts.radixFocus && opts.placeholder !== "" && opts.integerOptional === true;

					opts.definitions[";"] = opts.definitions["~"]; //clone integer def for decimals
					opts.definitions[";"].definitionSymbol = "~";

					if (opts.numericInput === true) { //finance people input style
						opts.radixFocus = false;
						opts.digitsOptional = false;
						if (isNaN(opts.digits)) opts.digits = 2;
						opts.decimalProtect = false;
					}

					var mask = autoEscape(opts.prefix);
					mask += "[+]";
					if (opts.integerOptional === true) {
						mask += "~{1," + opts.integerDigits + "}";
					} else mask += "~{" + opts.integerDigits + "}";
					if (opts.digits !== undefined && (isNaN(opts.digits) || parseInt(opts.digits) > 0)) {
						if (opts.digitsOptional) {
							mask += "[" + (opts.decimalProtect ? ":" : opts.radixPoint) + ";{1," + opts.digits + "}]";
						} else mask += (opts.decimalProtect ? ":" : opts.radixPoint) + ";{" + opts.digits + "}";
					}
					if (opts.negationSymbol.back !== "") {
						mask += "[-]";
					}
					mask += autoEscape(opts.suffix);

					opts.greedy = false; //enforce greedy false

					return mask;
				},
				placeholder: "",
				greedy: false,
				digits: "*", //number of fractionalDigits
				digitsOptional: true,
				radixPoint: ".",
				radixFocus: true,
				groupSize: 3,
				groupSeparator: "",
				autoGroup: false,
				allowPlus: true,
				allowMinus: true,
				negationSymbol: {
					front: "-", //"("
					back: "" //")"
				},
				integerDigits: "+", //number of integerDigits
				integerOptional: true,
				prefix: "",
				suffix: "",
				rightAlign: true,
				decimalProtect: true, //do not allow assumption of decimals input without entering the radixpoint
				min: null, //minimum value
				max: null, //maximum value
				step: 1,
				insertMode: true,
				autoUnmask: false,
				unmaskAsNumber: false,
				postFormat: function(buffer, pos, reformatOnly, opts) { //this needs to be removed // this is crap
					// console.log(buffer);
					if (opts.numericInput === true) {
						buffer = buffer.reverse();
						if (isFinite(pos)) {
							pos = buffer.join("").length - pos - 1;
						}
					}
					var suffixStripped = false,
						i, l;
					if (buffer.length >= opts.suffix.length && buffer.join("").indexOf(opts.suffix) === (buffer.length - opts.suffix.length)) {
						buffer.length = buffer.length - opts.suffix.length; //strip suffix
						suffixStripped = true;
					}
					//position overflow corrections
					pos = pos >= buffer.length ? buffer.length - 1 : (pos < opts.prefix.length ? opts.prefix.length : pos);

					var needsRefresh = false,
						charAtPos = buffer[pos];
					if (opts.groupSeparator === "" || (opts.numericInput !== true &&
							($.inArray(opts.radixPoint, buffer) !== -1 && pos > $.inArray(opts.radixPoint, buffer)) ||
							new RegExp("[" + Inputmask.escapeRegex(opts.negationSymbol.front) + "\+]").test(charAtPos))) {
						if (suffixStripped) {
							for (i = 0, l = opts.suffix.length; i < l; i++) {
								buffer.push(opts.suffix.charAt(i));
							}
						}
						//console.log("return input " + buffer);
						return {
							pos: pos
						};
					}

					var cbuf = buffer.slice();
					if (charAtPos === opts.groupSeparator) {
						cbuf.splice(pos--, 1);
						charAtPos = cbuf[pos];
					}
					if (reformatOnly) {
						if (charAtPos !== opts.radixPoint) cbuf[pos] = "?";
					} else cbuf.splice(pos, 0, "?"); //set position indicator
					var bufVal = cbuf.join(""),
						bufValOrigin = bufVal;
					if (bufVal.length > 0 && opts.autoGroup || (reformatOnly && bufVal.indexOf(opts.groupSeparator) !== -1)) {
						var escapedGroupSeparator = Inputmask.escapeRegex(opts.groupSeparator);
						needsRefresh = bufVal.indexOf(opts.groupSeparator) === 0;
						bufVal = bufVal.replace(new RegExp(escapedGroupSeparator, "g"), "");
						var radixSplit = bufVal.split(opts.radixPoint);
						bufVal = opts.radixPoint === "" ? bufVal : radixSplit[0];
						if (bufVal !== (opts.prefix + "?0") && bufVal.length >= (opts.groupSize + opts.prefix.length)) {
							//needsRefresh = true;
							var reg = new RegExp("([-\+]?[\\d\?]+)([\\d\?]{" + opts.groupSize + "})");
							while (reg.test(bufVal)) {
								bufVal = bufVal.replace(reg, "$1" + opts.groupSeparator + "$2");
								bufVal = bufVal.replace(opts.groupSeparator + opts.groupSeparator, opts.groupSeparator);
							}
						}
						if (opts.radixPoint !== "" && radixSplit.length > 1) {
							bufVal += opts.radixPoint + radixSplit[1];
						}
					}
					needsRefresh = bufValOrigin !== bufVal;
					buffer.length = bufVal.length; //align the length
					for (i = 0, l = bufVal.length; i < l; i++) {
						buffer[i] = bufVal.charAt(i);
					}
					var newPos = $.inArray("?", buffer);
					if (newPos === -1 && charAtPos === opts.radixPoint) newPos = $.inArray(opts.radixPoint, buffer);
					if (reformatOnly) buffer[newPos] = charAtPos;
					else buffer.splice(newPos, 1);

					if (!needsRefresh && suffixStripped) {
						for (i = 0, l = opts.suffix.length; i < l; i++) {
							buffer.push(opts.suffix.charAt(i));
						}
					}
					// console.log("formatted " + buffer + " refresh " + needsRefresh);
					newPos = (opts.numericInput && isFinite(pos)) ? buffer.join("").length - newPos - 1 : newPos;
					if (opts.numericInput) {
						buffer = buffer.reverse();
						if ($.inArray(opts.radixPoint, buffer) < newPos && (buffer.join("").length - opts.suffix.length) !== newPos) {
							newPos = newPos - 1;
						}
					}
					return {
						pos: newPos,
						"refreshFromBuffer": needsRefresh,
						"buffer": buffer
					};
				},
				onBeforeWrite: function(e, buffer, caretPos, opts) {
					if (e && (e.type === "blur" || e.type === "checkval")) {
						//handle minvalue
						var maskedValue = buffer.join(""),
							processValue = maskedValue.replace(opts.prefix, "");
						processValue = processValue.replace(opts.suffix, "");
						processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), "");
						if (opts.radixPoint === ",") processValue = processValue.replace(Inputmask.escapeRegex(opts.radixPoint), ".");

						if (isFinite(processValue)) {
							if (isFinite(opts.min) && parseFloat(processValue) < parseFloat(opts.min)) {
								return $.extend(true, {
									"refreshFromBuffer": true,
									"buffer": (opts.prefix + opts.min).split("")
								}, opts.postFormat((opts.prefix + opts.min).split(""), 0, true, opts));
							}
						}
						if (opts.numericInput !== true) {
							var tmpBufSplit = opts.radixPoint !== "" ? buffer.join("").split(opts.radixPoint) : [buffer.join("")],
								matchRslt = tmpBufSplit[0].match(opts.regex.integerPart(opts)),
								matchRsltDigits = tmpBufSplit.length === 2 ? tmpBufSplit[1].match(opts.regex.integerNPart(opts)) : undefined;
							if (matchRslt) {
								if ((matchRslt[0] === opts.negationSymbol.front + "0" || matchRslt[0] === opts.negationSymbol.front || matchRslt[0] === "+") && (matchRsltDigits === undefined || matchRsltDigits[0].match(/^0+$/))) {
									buffer.splice(matchRslt.index, 1);
								}
								var radixPosition = $.inArray(opts.radixPoint, buffer);
								if (radixPosition !== -1) {
									if (isFinite(opts.digits) && !opts.digitsOptional) {
										for (var i = 1; i <= opts.digits; i++) {
											if (buffer[radixPosition + i] === undefined || buffer[radixPosition + i] === opts.placeholder.charAt(0)) {
												buffer[radixPosition + i] = "0";
											}
										}
										return {
											"refreshFromBuffer": maskedValue !== buffer.join(""),
											"buffer": buffer
										};
									} else if (radixPosition === buffer.length - opts.suffix.length - 1) {
										buffer.splice(radixPosition, 1);
										return {
											"refreshFromBuffer": true,
											"buffer": buffer
										};
									}
								}
							}
						}
					}

					if (opts.autoGroup) {
						var rslt = opts.postFormat(buffer, opts.numericInput ? caretPos : caretPos - 1, true, opts);
						rslt.caret = caretPos <= opts.prefix.length ? rslt.pos : rslt.pos + 1;
						return rslt;
					}
				},
				regex: {
					integerPart: function(opts) {
						return new RegExp("[" + Inputmask.escapeRegex(opts.negationSymbol.front) + "\+]?\\d+");
					},
					integerNPart: function(opts) {
						return new RegExp("[\\d" + Inputmask.escapeRegex(opts.groupSeparator) + "]+");
					}
				},
				signHandler: function(chrs, maskset, pos, strict, opts) {
					if (!strict && (opts.allowMinus && chrs === "-") || (opts.allowPlus && chrs === "+")) {
						var matchRslt = maskset.buffer.join("").match(opts.regex.integerPart(opts));

						if (matchRslt && matchRslt[0].length > 0) {
							if (maskset.buffer[matchRslt.index] === (chrs === "-" ? "+" : opts.negationSymbol.front)) {
								if (chrs === "-") {
									if (opts.negationSymbol.back !== "") {
										return {
											"pos": matchRslt.index,
											"c": opts.negationSymbol.front,
											"remove": matchRslt.index,
											"caret": pos,
											"insert": {
												"pos": maskset.buffer.length - opts.suffix.length - 1,
												"c": opts.negationSymbol.back
											}
										};
									} else {
										return {
											"pos": matchRslt.index,
											"c": opts.negationSymbol.front,
											"remove": matchRslt.index,
											"caret": pos
										};
									}
								} else {
									if (opts.negationSymbol.back !== "") {
										return {
											"pos": matchRslt.index,
											"c": "+",
											"remove": [matchRslt.index, maskset.buffer.length - opts.suffix.length - 1],
											"caret": pos
										};
									} else {
										return {
											"pos": matchRslt.index,
											"c": "+",
											"remove": matchRslt.index,
											"caret": pos
										};
									}
								}
							} else if (maskset.buffer[matchRslt.index] === (chrs === "-" ? opts.negationSymbol.front : "+")) {
								if (chrs === "-" && opts.negationSymbol.back !== "") {
									return {
										"remove": [matchRslt.index, maskset.buffer.length - opts.suffix.length - 1],
										"caret": pos - 1
									};
								} else {
									return {
										"remove": matchRslt.index,
										"caret": pos - 1
									};
								}
							} else {
								if (chrs === "-") {
									if (opts.negationSymbol.back !== "") {
										return {
											"pos": matchRslt.index,
											"c": opts.negationSymbol.front,
											"caret": pos + 1,
											"insert": {
												"pos": maskset.buffer.length - opts.suffix.length,
												"c": opts.negationSymbol.back
											}
										};
									} else {
										return {
											"pos": matchRslt.index,
											"c": opts.negationSymbol.front,
											"caret": pos + 1
										};
									}
								} else {
									return {
										"pos": matchRslt.index,
										"c": chrs,
										"caret": pos + 1
									};
								}
							}
						}
					}
					return false;
				},
				radixHandler: function(chrs, maskset, pos, strict, opts) {
					if (!strict) {
						if ($.inArray(chrs, [",", "."]) !== -1) chrs = opts.radixPoint;
						if (chrs === opts.radixPoint && (opts.digits !== undefined && (isNaN(opts.digits) || parseInt(opts.digits) > 0))) {
							var radixPos = $.inArray(opts.radixPoint, maskset.buffer),
								integerValue = maskset.buffer.join("").match(opts.regex.integerPart(opts));

							if (radixPos !== -1 && maskset.validPositions[radixPos]) {
								if (maskset.validPositions[radixPos - 1]) {
									return {
										"caret": radixPos + 1
									};
								} else {
									return {
										"pos": integerValue.index,
										c: integerValue[0],
										"caret": radixPos + 1
									};
								}
							} else if (!integerValue || (integerValue["0"] === "0" && (integerValue.index + 1) !== pos)) {
								maskset.buffer[integerValue ? integerValue.index : pos] = "0";
								return {
									"pos": (integerValue ? integerValue.index : pos) + 1,
									c: opts.radixPoint
								};
							}
						}
					}
					return false;
				},
				leadingZeroHandler: function(chrs, maskset, pos, strict, opts) {
					if (opts.numericInput === true) {
						if (maskset.buffer[maskset.buffer.length - opts.prefix.length - 1] === "0") {
							return {
								"pos": pos,
								"remove": maskset.buffer.length - opts.prefix.length - 1
							};
						}
					} else {
						var matchRslt = maskset.buffer.join("").match(opts.regex.integerNPart(opts)),
							radixPosition = $.inArray(opts.radixPoint, maskset.buffer);
						if (matchRslt && !strict && (radixPosition === -1 || pos <= radixPosition)) {
							if (matchRslt["0"].indexOf("0") === 0) {
								if (pos < opts.prefix.length) pos = matchRslt.index; //position
								var _radixPosition = $.inArray(opts.radixPoint, maskset._buffer);
								var digitsMatch = maskset._buffer && maskset.buffer.slice(radixPosition).join("") === maskset._buffer.slice(_radixPosition).join("") || parseInt(maskset.buffer.slice(radixPosition + 1).join("")) === 0;
								var integerMatch = maskset._buffer && maskset.buffer.slice(matchRslt.index, radixPosition).join("") === maskset._buffer.slice(opts.prefix.length, _radixPosition).join("") || maskset.buffer.slice(matchRslt.index, radixPosition).join("") === "0";

								if (radixPosition === -1 || digitsMatch && integerMatch) {
									maskset.buffer.splice(matchRslt.index, 1);
									pos = pos > matchRslt.index ? pos - 1 : matchRslt.index;
									return {
										"pos": pos,
										"remove": matchRslt.index
									};
								} else if (matchRslt.index + 1 === pos || chrs === "0") {
									maskset.buffer.splice(matchRslt.index, 1);
									pos = matchRslt.index;
									return {
										"pos": pos,
										"remove": matchRslt.index
									};
								}
							} else if (chrs === "0" && pos <= matchRslt.index && matchRslt["0"] !== opts.groupSeparator) {
								return false;
							}
						}
					}
					return true;
				},
				postValidation: function(buffer, opts) {
					//handle maxvalue
					var isValid = true,
						maskedValue = buffer.join(""),
						processValue = maskedValue.replace(opts.prefix, "");
					processValue = processValue.replace(opts.suffix, "");
					processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), "");
					if (opts.radixPoint === ",") processValue = processValue.replace(Inputmask.escapeRegex(opts.radixPoint), ".");
					//handle negation symbol
					processValue = processValue.replace(new RegExp("^" + Inputmask.escapeRegex(opts.negationSymbol.front)), "-");
					processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.negationSymbol.back) + "$"), "");
					processValue = processValue === opts.negationSymbol.front ? processValue + "0" : processValue;

					if (isFinite(processValue)) {
						if (opts.max !== null && isFinite(opts.max)) {
							isValid = parseFloat(processValue) <= parseFloat(opts.max);
						}
						if (isValid && opts.min !== null && isFinite(opts.min) && (processValue <= 0 || processValue.toString().length >= opts.min.toString().length)) {
							isValid = parseFloat(processValue) >= parseFloat(opts.min);
							if (!isValid) {
								isValid = $.extend(true, {
									"refreshFromBuffer": true,
									"buffer": (opts.prefix + opts.min).split("")
								}, opts.postFormat((opts.prefix + opts.min).split(""), 0, true, opts));
								isValid.refreshFromBuffer = true; //enforce refresh
							}
						}
					}

					return isValid;
				},
				definitions: {
					"~": {
						validator: function(chrs, maskset, pos, strict, opts) {
							var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
							if (!isValid) {
								isValid = opts.radixHandler(chrs, maskset, pos, strict, opts);
								if (!isValid) {
									isValid = strict ? new RegExp("[0-9" + Inputmask.escapeRegex(opts.groupSeparator) + "]").test(chrs) : new RegExp("[0-9]").test(chrs);
									if (isValid === true) {
										isValid = opts.leadingZeroHandler(chrs, maskset, pos, strict, opts);
										if (isValid === true) {
											//handle overwrite when fixed precision
											var radixPosition = $.inArray(opts.radixPoint, maskset.buffer);
											if (radixPosition !== -1 && opts.digitsOptional === false && opts.numericInput !== true && pos > radixPosition && !strict) {
												isValid = {
													"pos": pos,
													"remove": pos
												};
											} else {
												isValid = {
													pos: pos
												};
											}
										}
									}
								}
							}

							return isValid;
						},
						cardinality: 1,
						prevalidator: null
					},
					"+": {
						validator: function(chrs, maskset, pos, strict, opts) {
							var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
							if (!isValid && ((strict && opts.allowMinus && chrs === opts.negationSymbol.front) || (opts.allowMinus && chrs === "-") || (opts.allowPlus && chrs === "+"))) {
								if (chrs === "-") {
									if (opts.negationSymbol.back !== "") {
										isValid = {
											"pos": pos,
											"c": chrs === "-" ? opts.negationSymbol.front : "+",
											"caret": pos + 1,
											"insert": {
												"pos": maskset.buffer.length,
												"c": opts.negationSymbol.back
											}
										};
									} else {
										isValid = {
											"pos": pos,
											"c": chrs === "-" ? opts.negationSymbol.front : "+",
											"caret": pos + 1
										};
									}
								} else {
									isValid = true;
								}
							}
							return isValid;
						},
						cardinality: 1,
						prevalidator: null,
						placeholder: ""
					},
					"-": {
						validator: function(chrs, maskset, pos, strict, opts) {
							var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
							if (!isValid && strict && opts.allowMinus && chrs === opts.negationSymbol.back) {
								isValid = true;
							}
							return isValid;
						},
						cardinality: 1,
						prevalidator: null,
						placeholder: ""
					},
					":": {
						validator: function(chrs, maskset, pos, strict, opts) {
							var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
							if (!isValid) {
								var radix = "[" + Inputmask.escapeRegex(opts.radixPoint) + ",\\." + "]";
								isValid = new RegExp(radix).test(chrs);
								if (isValid && maskset.validPositions[pos] && maskset.validPositions[pos].match.placeholder === opts.radixPoint) {
									isValid = {
										"caret": pos + 1
									};
								}
							}
							return isValid ? {
								c: opts.radixPoint
							} : isValid;
						},
						cardinality: 1,
						prevalidator: null,
						placeholder: function(opts) {
							return opts.radixPoint;
						}
					}
				},
				onUnMask: function(maskedValue, unmaskedValue, opts) {
					var processValue = maskedValue.replace(opts.prefix, "");
					processValue = processValue.replace(opts.suffix, "");
					processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), "");
					if (opts.unmaskAsNumber) {
						processValue = processValue.replace(Inputmask.escapeRegex.call(this, opts.radixPoint), ".");
						return Number(processValue);
					}
					return processValue;
				},
				isComplete: function(buffer, opts) {
					var maskedValue = buffer.join(""),
						bufClone = buffer.slice();
					//verify separator positions
					opts.postFormat(bufClone, 0, true, opts);
					if (bufClone.join("") !== maskedValue) return false;

					var processValue = maskedValue.replace(opts.prefix, "");
					processValue = processValue.replace(opts.suffix, "");
					processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), "");
					if (opts.radixPoint === ",") processValue = processValue.replace(Inputmask.escapeRegex(opts.radixPoint), ".");
					return isFinite(processValue);
				},
				onBeforeMask: function(initialValue, opts) {
					if (opts.radixPoint !== "" && isFinite(initialValue)) {
						initialValue = initialValue.toString().replace(".", opts.radixPoint);
					} else {
						var kommaMatches = initialValue.match(/,/g);
						var dotMatches = initialValue.match(/\./g);
						if (dotMatches && kommaMatches) {
							if (dotMatches.length > kommaMatches.length) {
								initialValue = initialValue.replace(/\./g, "");
								initialValue = initialValue.replace(",", opts.radixPoint);
							} else if (kommaMatches.length > dotMatches.length) {
								initialValue = initialValue.replace(/,/g, "");
								initialValue = initialValue.replace(".", opts.radixPoint);
							} else { //equal
								initialValue = initialValue.indexOf(".") < initialValue.indexOf(",") ? initialValue.replace(/\./g, "") : initialValue = initialValue.replace(/,/g, "");
							}
						} else {
							initialValue = initialValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), "");
						}
					}

					if (opts.digits === 0) {
						if (initialValue.indexOf(".") !== -1) {
							initialValue = initialValue.substring(0, initialValue.indexOf("."));
						} else if (initialValue.indexOf(",") !== -1) {
							initialValue = initialValue.substring(0, initialValue.indexOf(","));
						}
					}

					if (opts.radixPoint !== "" && isFinite(opts.digits) && initialValue.indexOf(opts.radixPoint) !== -1) {
						var valueParts = initialValue.split(opts.radixPoint),
							decPart = valueParts[1].match(new RegExp("\\d*"))[0];
						if (parseInt(opts.digits) < decPart.toString().length) {
							var digitsFactor = Math.pow(10, parseInt(opts.digits));
							//make the initialValue a valid javascript number for the parsefloat
							initialValue = initialValue.replace(Inputmask.escapeRegex(opts.radixPoint), ".");
							initialValue = Math.round(parseFloat(initialValue) * digitsFactor) / digitsFactor;
							initialValue = initialValue.toString().replace(".", opts.radixPoint);
						}
					}
					return initialValue.toString();
				},
				canClearPosition: function(maskset, position, lvp, strict, opts) {
					var positionInput = maskset.validPositions[position].input,
						canClear = ((positionInput !== opts.radixPoint || (maskset.validPositions[position].match.fn !== null && opts.decimalProtect === false)) || isFinite(positionInput)) ||
						position === lvp ||
						positionInput === opts.groupSeparator ||
						positionInput === opts.negationSymbol.front ||
						positionInput === opts.negationSymbol.back;

					if (canClear && isFinite(positionInput)) {
						var matchRslt,
							radixPos = $.inArray(opts.radixPoint, maskset.buffer);

						//inject radixpoint
						var radixInjection = false;
						if (maskset.validPositions[radixPos] === undefined) {
							maskset.validPositions[radixPos] = {
								input: opts.radixPoint
							};
							radixInjection = true;
						}

						if (!strict && maskset.buffer) {
							matchRslt = maskset.buffer.join("").substr(0, position).match(opts.regex.integerNPart(opts));
							var pos = position + 1,
								isNull = matchRslt == null || parseInt(matchRslt["0"].replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), "")) === 0;
							if (isNull) {
								while (maskset.validPositions[pos] && (maskset.validPositions[pos].input === opts.groupSeparator || maskset.validPositions[pos].input === "0")) {
									delete maskset.validPositions[pos];
									pos++;
								}
							}
						}

						var buffer = [];
						//build new buffer from validPositions
						for (var vp in maskset.validPositions) {
							if (maskset.validPositions[vp].input !== undefined) buffer.push(maskset.validPositions[vp].input);
						}
						//remove radix Injection
						if (radixInjection) {
							delete maskset.validPositions[radixPos];
						}

						if (radixPos > 0) {
							var bufVal = buffer.join("");
							matchRslt = bufVal.match(opts.regex.integerNPart(opts));
							if (matchRslt && position <= radixPos) {
								if (matchRslt["0"].indexOf("0") === 0) {
									canClear = matchRslt.index !== position || opts.placeholder === "0";
								} else {
									var intPart = parseInt(matchRslt["0"].replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), "")),
										radixPart = parseInt(bufVal.split(opts.radixPoint)[1]);
									if (intPart < 10 && maskset.validPositions[position] && (opts.placeholder !== "0" || radixPart > 0)) {
										maskset.validPositions[position].input = "0";
										maskset.p = opts.prefix.length + 1;
										canClear = false;
									}
								}
							}
						}
					}

					return canClear;
				},
				onKeyDown: function(e, buffer, caretPos, opts) {
					var $input = $(this);
					if (e.ctrlKey) {
						switch (e.keyCode) {
							case Inputmask.keyCode.UP:
								$input.val(parseFloat(this.inputmask.unmaskedvalue()) + parseInt(opts.step));
								$input.triggerHandler("setvalue.inputmask");
								break;
							case Inputmask.keyCode.DOWN:
								$input.val(parseFloat(this.inputmask.unmaskedvalue()) - parseInt(opts.step));
								$input.triggerHandler("setvalue.inputmask");
								break;
						}
					}
				}
			},
			"currency": {
				prefix: "$ ",
				groupSeparator: ",",
				alias: "numeric",
				placeholder: "0",
				autoGroup: true,
				digits: 2,
				digitsOptional: false,
				clearMaskOnLostFocus: false
			},
			"decimal": {
				alias: "numeric"
			},
			"integer": {
				alias: "numeric",
				digits: 0,
				radixPoint: ""
			},
			"percentage": {
				alias: "numeric",
				digits: 2,
				radixPoint: ".",
				placeholder: "0",
				autoGroup: false,
				min: 0,
				max: 100,
				suffix: " %",
				allowPlus: false,
				allowMinus: false
			}
		});
		return Inputmask;
	}));
/*
Input Mask plugin extensions
http://github.com/RobinHerbots/jquery.inputmask
Copyright (c) 2010 -  Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.0-dev

Regex extensions on the jquery.inputmask base
Allows for using regular expressions as a mask
*/
(function(factory) {
		if (typeof define === "function" && define.amd) {
			define(["jquery", "inputmask"], factory);
		} else if (typeof exports === "object") {
			module.exports = factory(require("jquery"), require("./inputmask"));
		} else {
			factory(jQuery, window.Inputmask);
		}
	}
	(function($, Inputmask) {
	Inputmask.extendAliases({ // $(selector).inputmask("Regex", { regex: "[0-9]*"}
		"Regex": {
			mask: "r",
			greedy: false,
			repeat: "*",
			regex: null,
			regexTokens: null,
			//Thx to https://github.com/slevithan/regex-colorizer for the tokenizer regex
			tokenizer: /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
			quantifierFilter: /[0-9]+[^,]/,
			isComplete: function(buffer, opts) {
				return new RegExp(opts.regex).test(buffer.join(""));
			},
			definitions: {
				"r": {
					validator: function(chrs, maskset, pos, strict, opts) {
						var cbuffer = maskset.buffer.slice(),
							regexPart = "",
							isValid = false,
							openGroupCount = 0,
							groupToken;

						function RegexToken(isGroup, isQuantifier) {
							this.matches = [];
							this.isGroup = isGroup || false;
							this.isQuantifier = isQuantifier || false;
							this.quantifier = {
								min: 1,
								max: 1
							};
							this.repeaterPart = undefined;
						}

						function analyseRegex() {
							var currentToken = new RegexToken(),
								match, m, opengroups = [];

							opts.regexTokens = [];

							// The tokenizer regex does most of the tokenization grunt work
							while (match = opts.tokenizer.exec(opts.regex)) {
								m = match[0];
								switch (m.charAt(0)) {
									case "(": // Group opening
										opengroups.push(new RegexToken(true));
										break;
									case ")": // Group closing
										groupToken = opengroups.pop();
										if (opengroups.length > 0)
											opengroups[opengroups.length - 1].matches.push(groupToken);
										else
											currentToken.matches.push(groupToken);

										break;
									case "{":
									case "+":
									case "*": //Quantifier
										var quantifierToken = new RegexToken(false, true);
										m = m.replace(/[{}]/g, "");
										var mq = m.split(","),
											mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]),
											mq1 = mq.length === 1 ? mq0 : (isNaN(mq[1]) ? mq[1] : parseInt(mq[1]));
										quantifierToken.quantifier = {
											min: mq0,
											max: mq1
										};
										if (opengroups.length > 0) {
											var matches = opengroups[opengroups.length - 1].matches;
											match = matches.pop();
											if (!match.isGroup) {
												groupToken = new RegexToken(true);
												groupToken.matches.push(match);
												match = groupToken;
											}
											matches.push(match);
											matches.push(quantifierToken);
										} else {
											match = currentToken.matches.pop();
											if (!match.isGroup) {
												groupToken = new RegexToken(true);
												groupToken.matches.push(match);
												match = groupToken;
											}
											currentToken.matches.push(match);
											currentToken.matches.push(quantifierToken);
										}
										break;
									default:
										if (opengroups.length > 0) {
											opengroups[opengroups.length - 1].matches.push(m);
										} else {
											currentToken.matches.push(m);
										}
										break;
								}
							}

							if (currentToken.matches.length > 0)
								opts.regexTokens.push(currentToken);
						}

						function validateRegexToken(token, fromGroup) {
							var isvalid = false;
							if (fromGroup) {
								regexPart += "(";
								openGroupCount++;
							}
							for (var mndx = 0; mndx < token.matches.length; mndx++) {
								var matchToken = token.matches[mndx];
								if (matchToken.isGroup === true) {
									isvalid = validateRegexToken(matchToken, true);
								} else if (matchToken.isQuantifier === true) {
									var crrntndx = $.inArray(matchToken, token.matches),
										matchGroup = token.matches[crrntndx - 1];
									var regexPartBak = regexPart;
									if (isNaN(matchToken.quantifier.max)) {
										while (matchToken.repeaterPart && matchToken.repeaterPart !== regexPart && matchToken.repeaterPart.length > regexPart.length) {
											isvalid = validateRegexToken(matchGroup, true);
											if (isvalid) break;
										}
										isvalid = isvalid || validateRegexToken(matchGroup, true);
										if (isvalid) matchToken.repeaterPart = regexPart;
										regexPart = regexPartBak + matchToken.quantifier.max;
									} else {
										for (var i = 0, qm = matchToken.quantifier.max - 1; i < qm; i++) {
											isvalid = validateRegexToken(matchGroup, true);
											if (isvalid) break;
										}
										regexPart = regexPartBak + "{" + matchToken.quantifier.min + "," + matchToken.quantifier.max + "}";
									}
								} else if (matchToken.matches !== undefined) {
									for (var k = 0; k < matchToken.length; k++) {
										isvalid = validateRegexToken(matchToken[k], fromGroup);
										if (isvalid) break;
									}
								} else {
									var testExp;
									if (matchToken.charAt(0) == "[") {
										testExp = regexPart;
										testExp += matchToken;
										for (var j = 0; j < openGroupCount; j++) {
											testExp += ")";
										}
										var exp = new RegExp("^(" + testExp + ")$");
										isvalid = exp.test(bufferStr);
									} else {
										for (var l = 0, tl = matchToken.length; l < tl; l++) {
											if (matchToken.charAt(l) === "\\") continue;
											testExp = regexPart;
											testExp += matchToken.substr(0, l + 1);
											testExp = testExp.replace(/\|$/, "");
											for (var j = 0; j < openGroupCount; j++) {
												testExp += ")";
											}
											var exp = new RegExp("^(" + testExp + ")$");
											isvalid = exp.test(bufferStr);
											if (isvalid) break;
										}
									}
									regexPart += matchToken;
								}
								if (isvalid) break;
							}

							if (fromGroup) {
								regexPart += ")";
								openGroupCount--;
							}

							return isvalid;
						}

						if (opts.regexTokens === null)
							analyseRegex();


						cbuffer.splice(pos, 0, chrs);
						var bufferStr = cbuffer.join("");
						for (var i = 0; i < opts.regexTokens.length; i++) {
							var regexToken = opts.regexTokens[i];
							isValid = validateRegexToken(regexToken, regexToken.isGroup);
							if (isValid) break;
						}

						return isValid;
					},
					cardinality: 1
				}
			}
		}
	});
	return Inputmask;
}));
/*
Input Mask plugin extensions
http://github.com/RobinHerbots/jquery.inputmask
Copyright (c) 2010 -  Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.0-dev

Optional extensions on the jquery.inputmask base
*/
(function(factory) {
		if (typeof define === "function" && define.amd) {
			define(["jquery", "inputmask"], factory);
		} else if (typeof exports === "object") {
			module.exports = factory(require("jquery"), require("./inputmask"));
		} else {
			factory(jQuery, window.Inputmask);
		}
	}
	(function($, Inputmask) {
	//extra definitions
	Inputmask.extendDefinitions({
		"A": {
			validator: "[A-Za-z\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5]",
			cardinality: 1,
			casing: "upper" //auto uppercasing
		},
		"&": { //alfanumeric uppercasing
			validator: "[0-9A-Za-z\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5]",
			cardinality: 1,
			casing: "upper"
		},
		"#": { //hexadecimal
			validator: "[0-9A-Fa-f]",
			cardinality: 1,
			casing: "upper"
		}
	});
	Inputmask.extendAliases({
		"url": {
			mask: "ir",
			placeholder: "",
			separator: "",
			defaultPrefix: "http://",
			regex: {
				urlpre1: new RegExp("[fh]"),
				urlpre2: new RegExp("(ft|ht)"),
				urlpre3: new RegExp("(ftp|htt)"),
				urlpre4: new RegExp("(ftp:|http|ftps)"),
				urlpre5: new RegExp("(ftp:/|ftps:|http:|https)"),
				urlpre6: new RegExp("(ftp://|ftps:/|http:/|https:)"),
				urlpre7: new RegExp("(ftp://|ftps://|http://|https:/)"),
				urlpre8: new RegExp("(ftp://|ftps://|http://|https://)")
			},
			definitions: {
				"i": {
					validator: function(chrs, maskset, pos, strict, opts) {
						return true;
					},
					cardinality: 8,
					prevalidator: (function() {
						var result = [],
							prefixLimit = 8;
						for (var i = 0; i < prefixLimit; i++) {
							result[i] = (function() {
								var j = i;
								return {
									validator: function(chrs, maskset, pos, strict, opts) {
										if (opts.regex["urlpre" + (j + 1)]) {
											var tmp = chrs,
												k;
											if (((j + 1) - chrs.length) > 0) {
												tmp = maskset.buffer.join('').substring(0, ((j + 1) - chrs.length)) + "" + tmp;
											}
											var isValid = opts.regex["urlpre" + (j + 1)].test(tmp);
											if (!strict && !isValid) {
												pos = pos - j;
												for (k = 0; k < opts.defaultPrefix.length; k++) {
													maskset.buffer[pos] = opts.defaultPrefix[k];
													pos++;
												}
												for (k = 0; k < tmp.length - 1; k++) {
													maskset.buffer[pos] = tmp[k];
													pos++;
												}
												return {
													"pos": pos
												};
											}
											return isValid;
										} else {
											return false;
										}
									},
									cardinality: j
								};
							})();
						}
						return result;
					})()
				},
				"r": {
					validator: ".",
					cardinality: 50
				}
			},
			insertMode: false,
			autoUnmask: false
		},
		"ip": { //ip-address mask
			mask: "i[i[i]].i[i[i]].i[i[i]].i[i[i]]",
			definitions: {
				"i": {
					validator: function(chrs, maskset, pos, strict, opts) {
						if (pos - 1 > -1 && maskset.buffer[pos - 1] !== ".") {
							chrs = maskset.buffer[pos - 1] + chrs;
							if (pos - 2 > -1 && maskset.buffer[pos - 2] !== ".") {
								chrs = maskset.buffer[pos - 2] + chrs;
							} else chrs = "0" + chrs;
						} else chrs = "00" + chrs;
						return new RegExp("25[0-5]|2[0-4][0-9]|[01][0-9][0-9]").test(chrs);
					},
					cardinality: 1
				}
			}
		},
		"email": {
			mask: "*{1,64}[.*{1,64}][.*{1,64}][.*{1,64}]@*{1,64}[.*{2,64}][.*{2,6}][.*{1,2}]",
			greedy: false,
			onBeforePaste: function(pastedValue, opts) {
				pastedValue = pastedValue.toLowerCase();
				return pastedValue.replace("mailto:", "");
			},
			definitions: {
				"*": {
					validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~\-]",
					cardinality: 1,
					casing: "lower"
				}
			}
		},
		"mac": {
			mask: "##:##:##:##:##:##"
		}
	});
	return Inputmask;
}));
