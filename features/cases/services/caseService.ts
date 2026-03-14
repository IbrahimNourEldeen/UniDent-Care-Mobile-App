import api from "@/utils/api";

export const createCase = (data: {
    PatientId: string;
    Title: string;
    Description: string;
    CaseTypeId: string;
    Images?: File[];
}) => {
    const formData = new FormData();
    formData.append("PatientId", data.PatientId);
    formData.append("Title", data.Title);
    formData.append("Description", data.Description);
    formData.append("CaseTypeId", data.CaseTypeId);

    if (data.Images && data.Images.length > 0) {
        data.Images.forEach((image) => {
            formData.append("Images", image);
        });
    }

    return api.post("/Cases", formData);
};