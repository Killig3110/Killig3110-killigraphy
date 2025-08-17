import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_ESXnVnzPIC6WUaW0z5wXOrfEt78",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_Rc9sxzaXhEjCdUKdr55Idjy9Brw",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "ttps://ik.imagekit.io/killigraphy",
});

export default imagekit;
