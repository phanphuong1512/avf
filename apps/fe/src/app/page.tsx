"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createBooking, getSlots, getSurgeons, SlotItem, Surgeon } from "@/lib/api";

function timeLabel(iso: string) {
  // iso is Vietnam time from backend, display directly
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  });
}

export default function Page() {
  // cấu hình mặc định
  const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
  const [surgeonId, setSurgeonId] = useState<number>(1); // Sẽ cập nhật khi load surgeons
  const durationMin = 90; // Fixed duration

  // Get today's date in Vietnam timezone for validation and default
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }); // Returns YYYY-MM-DD format

  const [date, setDate] = useState<string>(today);

  // dữ liệu/ UI state
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pickedStartAt, setPickedStartAt] = useState<string | null>(null);

  // form
  const [contactPhone, setContactPhone] = useState("");
  const [bookerName, setBookerName] = useState(""); // chưa gửi lên BE (tránh lỗi whitelist)
  const [patientName, setPatientName] = useState("");

  // success notification
  const [showSuccess, setShowSuccess] = useState(false);

  // Load surgeons on component mount
  useEffect(() => {
    (async () => {
      try {
        const surgeonData = await getSurgeons();
        setSurgeons(surgeonData);
        // Always default to surgeon ID = 1 if available
        const defaultSurgeon = surgeonData.find(s => s.id === 1);
        if (defaultSurgeon) {
          setSurgeonId(1);
        } else if (surgeonData.length > 0) {
          setSurgeonId(surgeonData[0].id); // Fallback to first surgeon
        }
      } catch (e) {
        console.error("Error loading surgeons:", e);
      }
    })();
  }, []);

  // nạp slot khi đổi ngày / thời lượng / bác sĩ
  useEffect(() => {
    (async () => {
      setLoadingSlots(true);
      try {
        const data = await getSlots({
          date,
          surgeonId,
          durationMin,
          stepMin: 15,
          startHour: 9,
          endHour: 19,
        });
        setSlots(data);
        setPickedStartAt(null);
      } catch (e) {
        console.error(e);
        alert("Không tải được slot, kiểm tra backend.");
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [date, durationMin, surgeonId]);

  const canSubmit = useMemo(() => {
    return !!pickedStartAt && !!patientName && !!contactPhone;
  }, [pickedStartAt, patientName, contactPhone]);

  async function submit() {
    if (!pickedStartAt) return;
    try {
      await createBooking({
        surgeonId,
        startAt: pickedStartAt,
        durationMin,
        // New schema fields
        patientName,
        patientPhone: contactPhone,
        patientDiagnosis: undefined, // Optional field
        bookerName: bookerName || undefined,
        bookerPhone: contactPhone, // Same phone for now
      });
      // Show success notification
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000); // Hide after 5 seconds

      // Clear form data
      setContactPhone("");
      setBookerName("");
      setPatientName("");

      // reload slot để disable các slot trùng
      const data = await getSlots({
        date,
        surgeonId,
        durationMin,
        stepMin: 15,
        startHour: 9,
        endHour: 19,
      });
      setSlots(data);
      setPickedStartAt(null);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? "Đặt lịch thất bại";
      alert(typeof msg === "string" ? msg : JSON.stringify(e));
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800">

      {/* Success Notification */}
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 notification-enter">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl shadow-2xl border border-green-400 notification-bounce">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg">Đặt lịch thành công!</p>
                <p className="text-sm opacity-90">
                  Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi
                </p>
              </div>
              <div className="shimmer-bg absolute inset-0 rounded-xl opacity-20"></div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-4 lg:gap-8 p-4 lg:p-6">
        {/* LEFT: doctor card + form info - horizontal layout */}
        <div className="space-y-4">
          {/* Doctor card - horizontal rectangle 4:3 aspect ratio */}
          <div className="relative w-full aspect-[4/3] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl overflow-hidden shadow-xl">
            {/* Hospital logo/badge */}
            <div className="absolute top-3 right-3 bg-yellow-400 text-blue-800 px-2 py-1 rounded-full shadow-lg z-30">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8-1a1 1 0 00-1 1v2H8a1 1 0 000 2h2v2a1 1 0 002 0v-2h2a1 1 0 000-2h-2V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold">AVF</span>
              </div>
            </div>

            {/* Text content overlay - left side */}
            <div className="absolute top-3 left-3 text-white z-30 max-w-[45%]">
              <h2 className="text-sm lg:text-xl font-bold mb-1 leading-tight">
                Chuyên khoa Thận Nhân Tạo
              </h2>
              <p className="text-xs lg:text-sm text-blue-100 font-medium">
                Chuyên Gia Thủ Thuật AVF
              </p>
              <p className="text-sm lg:text-lg text-yellow-300 font-bold mt-1 truncate">
                {surgeons.find(s => s.id === surgeonId)?.name || 'Đang tải...'}
              </p>
              {/* Years of experience */}
              {(() => {
                const surgeon = surgeons.find(s => s.id === surgeonId);
                const experienceYears = surgeon?.startedYear ? new Date().getFullYear() - surgeon.startedYear : null;
                return experienceYears ? (
                  <p className="text-xs lg:text-sm text-blue-200 font-medium mt-1">
                    {experienceYears} năm kinh nghiệm
                  </p>
                ) : null;
              })()}
            </div>

            {/* Doctor image - right side of horizontal card */}
            <div className="absolute bottom-0 right-0 w-[55%] h-full z-20">
              <Image
                src={surgeonId === 1 ? "/doctor-PhanCuong.png" : "/doctor-PhanCong.png"}
                alt="Bác sĩ chuyên khoa"
                width={1200}
                height={1600}
                className="w-full h-full object-contain object-bottom"
                priority
              />
            </div>
          </div>

          {/* Form info moved to left side */}
          <div className="space-y-3">
            {/* Hospital address note */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-3 lg:p-4 rounded-xl border-l-4 border-blue-500">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-blue-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1 text-sm">
                    Địa chỉ thực hiện khám bệnh
                  </h3>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Bệnh viện đa khoa Tràng An
                    <br />
                    59 Ng. Thông Phong, Văn Chương, Đống Đa, Hà Nội
                  </p>
                </div>
              </div>
            </div>

            {/* Surgeon selection moved here */}
            <div className="space-y-2">
              <label htmlFor="surgeonId" className="text-sm font-medium text-blue-700">
                Chọn bác sĩ <span className="text-red-500">*</span>
              </label>
              <select
                id="surgeonId"
                value={surgeonId}
                onChange={(e) => setSurgeonId(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 bg-white text-gray-800 border-2 border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              >
                {surgeons.map((surgeon) => {
                  const experienceYears = surgeon.startedYear ? new Date().getFullYear() - surgeon.startedYear : 0;
                  return (
                    <option key={surgeon.id} value={surgeon.id}>
                      {surgeon.name} - {surgeon.specialization} ({experienceYears} năm KN)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT: booking form - compact layout */}
        <div className="space-y-4">
          <header className="space-y-1">
            <h1 className="text-xl lg:text-2xl font-bold text-blue-700">
              Đặt lịch khám thủ thuật AVF
            </h1>
            <p className="text-sm text-blue-600">
              Chọn ngày/giờ và điền thông tin liên hệ để đặt lịch khám bệnh.
            </p>
          </header>

          {/* form fields - compact grid */}
          <section className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="contactPhone" className="text-sm font-medium text-blue-700">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="VD: 0912 345 678"
                className="w-full rounded-lg px-3 py-2 bg-white text-gray-800 border-2 border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bookerName" className="text-sm font-medium text-blue-700">
                Họ & tên người đặt (tuỳ chọn)
              </label>
              <input
                id="bookerName"
                value={bookerName}
                onChange={(e) => setBookerName(e.target.value)}
                placeholder="Tên người đặt lịch"
                className="w-full rounded-lg px-3 py-2 bg-white text-gray-800 border-2 border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="patientName" className="text-sm font-medium text-blue-700">
                Họ & tên người bệnh <span className="text-red-500">*</span>
              </label>
              <input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Tên người bệnh"
                className="w-full rounded-lg px-3 py-2 bg-white text-gray-800 border-2 border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="selectedDate" className="text-sm font-medium text-blue-700">
                Ngày đặt lịch <span className="text-red-500">*</span>
              </label>
              <input
                id="selectedDate"
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                lang="vi-VN"
                className="w-full rounded-lg px-3 py-2 bg-white text-gray-800 border-2 border-blue-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              />
            </div>
          </section>

          {/* grid slots - compact layout */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-blue-700">
                Chọn khung giờ khám <span className="text-red-500">*</span>
              </h2>
              {loadingSlots && (
                <span className="text-xs text-blue-500 animate-pulse">
                  Đang tải...
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {slots.map((s) => {
                const disabled = !s.available;
                const active = pickedStartAt === s.startAt;
                let buttonClasses =
                  "rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-200 ";

                if (disabled) {
                  buttonClasses +=
                    "bg-gray-100 text-gray-400 cursor-not-allowed";
                } else if (active) {
                  buttonClasses += "bg-blue-500 text-white shadow-md";
                } else {
                  buttonClasses +=
                    "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300";
                }

                return (
                  <button
                    key={s.startAt}
                    disabled={disabled}
                    onClick={() => setPickedStartAt(s.startAt)}
                    className={buttonClasses}
                    title={s.startAt}
                  >
                    {timeLabel(s.startAt)}
                  </button>
                );
              })}
            </div>
          </section>

          {/* submit - compact layout */}
          <div className="pt-2">
            <div className="space-y-3">
              {/* Booking button with calendar icon */}
              <button
                disabled={!canSubmit}
                onClick={submit}
                className={[
                  "w-full rounded-lg px-4 py-3 font-bold text-base transition-all duration-200 flex items-center justify-center space-x-2",
                  canSubmit
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed",
                ].join(" ")}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Đặt lịch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
