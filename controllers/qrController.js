const axios = require("axios");
const supabase = require("../config/supabase");
const QRCode = require("qrcode");
const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");

// Create QR
exports.createQR = async (req, res) => {
    try {
        const { title, destination_url } = req.body;

        if (!title || !destination_url) {
            return res.status(400).json({
                success: false,
                message: "Title and Destination URL are required"
            });
        }

        const shortCode = nanoid(8);

        // Save into Supabase
        const { data, error } = await supabase
            .from("qr_codes")
            .insert([
                {
                    title,
                    short_code: shortCode,
                    destination_url
                }
            ])
            .select();

        if (error) {
            return res.status(500).json(error);
        }

        // Create QR Folder
        const qrFolder = path.join(__dirname, "../public/qr");

        if (!fs.existsSync(qrFolder)) {
            fs.mkdirSync(qrFolder, { recursive: true });
        }

        const qrPath = path.join(qrFolder, `${shortCode}.png`);

        // Base URL for Local / Render
const baseURL = process.env.BASE_URL || "http://localhost:3000";

// QR Redirect URL
const qrURL = `${baseURL}/api/r/${shortCode}`;

// Save QR Image
await QRCode.toFile(qrPath, qrURL);

res.status(201).json({
    success: true,
    message: "QR Created Successfully",
    short_code: shortCode,
    qr_url: qrURL,
    qr_image: `${baseURL}/qr/${shortCode}.png`,
    data
});

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


// Get All QR
exports.getAllQR = async (req, res) => {

    const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
};


// Redirect QR
exports.redirectQR = async (req, res) => {

    const { code } = req.params;

    // Find QR by short code
    const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("short_code", code)
        .single();

    if (error || !data) {
        return res.status(404).send("QR Not Found");
    }

    // Update scan count and last scan date/time
    const { error: updateError } = await supabase
        .from("qr_codes")
        .update({
            scan_count: data.scan_count + 1,
            last_scan: new Date().toISOString()
        })
        .eq("id", data.id);

    if (updateError) {
        console.error("Update Error:", updateError);
    }

    // Redirect to Google Form
    res.redirect(data.destination_url);
};
exports.getResponses = async (req, res) => {

    try {

        const url = "https://script.google.com/macros/s/AKfycbyz2xZHJoRcqTXVchRe8AxxjUxN_eWLBzXDZQx8uieCho37TzSXrtQshP35zo8GUtGW/exec";

        const response = await axios.get(url);

        res.json(response.data);

    } catch (err) {

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

};


exports.deleteQR = async (req,res)=>{

    const {id}=req.params;

    const {error}=await supabase
    .from("qr_codes")
    .delete()
    .eq("id",id);

    if(error){

        return res.status(500).json(error);

    }

    res.json({

        success:true

    });

};