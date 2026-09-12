// Workaround for Node.js v24.14+ on Windows where fs.readlink / readlinkSync
// throws EISDIR instead of EINVAL on regular non-symlink files on NTFS.
// Webpack expects EINVAL when checking if a file is a symlink.

const fs = require("node:fs");

function patchReadlinkSync(orig) {
  return function (path, options) {
    try {
      return orig.call(fs, path, options);
    } catch (err) {
      if (err && err.code === "EISDIR") {
        err.code = "EINVAL";
      }
      throw err;
    }
  };
}

function patchReadlink(orig) {
  return function (path, options, callback) {
    const cb = typeof options === "function" ? options : callback;
    const opts = typeof options === "function" ? undefined : options;

    const wrappedCb = (err, linkString) => {
      if (err && err.code === "EISDIR") {
        err.code = "EINVAL";
      }
      if (cb) cb(err, linkString);
    };

    if (opts !== undefined) {
      return orig.call(fs, path, opts, wrappedCb);
    } else {
      return orig.call(fs, path, wrappedCb);
    }
  };
}

if (fs.readlinkSync) {
  fs.readlinkSync = patchReadlinkSync(fs.readlinkSync);
}

if (fs.readlink) {
  fs.readlink = patchReadlink(fs.readlink);
}

if (fs.promises && fs.promises.readlink) {
  const origPromises = fs.promises.readlink;
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromises.call(fs.promises, path, options);
    } catch (err) {
      if (err && err.code === "EISDIR") {
        err.code = "EINVAL";
      }
      throw err;
    }
  };
}
