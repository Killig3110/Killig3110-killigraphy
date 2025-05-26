import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { convertFileToUrl } from "@/lib/utils";
import Cropper, { Area } from "react-easy-crop";
import getCroppedImg from "@/lib/getCroppedImage";

type ProfileUploaderProps = {
    fieldChange: (files: File[]) => void;
    mediaUrl: string;
    onAvatarConfirmed?: (file: File) => void;
};

const ProfileUploader = ({ fieldChange, mediaUrl, onAvatarConfirmed }: ProfileUploaderProps) => {
    const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // File to be cropped

    const [crop, setCrop] = useState({ x: 0, y: 0 }); // Crop position in pixels at the top left corner
    const [zoom, setZoom] = useState(1); // Zoom level
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>() // Area to crop in pixels 

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        const newFile = acceptedFiles[0]; // Get the first file from the accepted files
        if (newFile) {
            setSelectedFile(newFile); // Set the selected file for cropping
            setPreviewUrl(convertFileToUrl(newFile)); // Convert the file to a URL for preview
            setShowDialog(true); // Show the dialog for cropping
        }
    }, []);

    const onCropComplete = (_: any, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const confirmSelection = async () => {
        if (!selectedFile || !croppedAreaPixels) return; // Ensure a file is selected and cropped area is defined

        const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels); // Get the cropped image as a blob
        const croppedFile = new File([croppedBlob], selectedFile.name, { type: selectedFile.type }); // Create a new file from the cropped blob 

        onAvatarConfirmed?.(croppedFile);
        fieldChange([croppedFile]); // Call the fieldChange function with the cropped file
        setFileUrl(URL.createObjectURL(croppedBlob)); // Create a URL for the cropped blob
        setShowDialog(false); // Close the dialog
    };

    const cancelSelection = () => {
        setSelectedFile(null); // Reset the selected file
        setPreviewUrl("");  // Clear the preview URL
        setShowDialog(false); // Close the dialog
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpeg", ".jpg"] },
    });

    return (
        <>
            <div {...getRootProps()} className="cursor-pointer flex-center gap-4">
                <input {...getInputProps()} className="cursor-pointer" />
                <img
                    src={fileUrl || "/assets/icons/profile-placeholder.svg"}
                    alt="profile"
                    className="h-24 w-24 rounded-full object-cover object-top"
                />
                <p className="text-primary-500 small-regular md:base-semibold">
                    Change profile photo
                </p>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Preview your new avatar</DialogTitle>
                    </DialogHeader>

                    {/* Cropper */}
                    <div className="relative w-full h-64 bg-black">
                        <Cropper
                            image={previewUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={cancelSelection}>
                            Cancel
                        </Button>
                        <Button onClick={confirmSelection}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProfileUploader;
