/**
 * LibraryPage — 图书馆预约控制台 (baseline LibraryControl.vue).
 * Aliyun FC endpoint; status/toggle/set-seat actions; 3000ms auto-clear
 * messages; Enter submits.
 */
import { useCallback, useEffect, useState } from "react";

const FC_URL = "https://libraryion-ctrl-gvjqodsukd.cn-hongkong.fcapp.run/";
const SEAT_OFFSET = 101267703;

type MsgType = "success" | "error";

interface FcResponse {
	triggerEnabled?: boolean;
	seatId?: number | string;
	success?: boolean;
	error?: string;
}

export default function LibraryPage() {
	const [statusLoading, setStatusLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [triggerEnabled, setTriggerEnabled] = useState(false);
	const [seatInput, setSeatInput] = useState("");
	const [msg, setMsg] = useState("");
	const [msgType, setMsgType] = useState<MsgType>("success");

	const post = useCallback(
		async (body: Record<string, unknown>): Promise<FcResponse> => {
			const res = await fetch(FC_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			return res.json();
		},
		[],
	);

	const fetchStatus = useCallback(async () => {
		setStatusLoading(true);
		try {
			const data = await post({ action: "status" });
			setTriggerEnabled(!!data.triggerEnabled);
			if (data.seatId !== undefined && data.seatId !== null) {
				const seat = Number(data.seatId);
				const display = Number.isFinite(seat)
					? seat - SEAT_OFFSET
					: data.seatId;
				setSeatInput(String(display));
			}
		} catch (e) {
			setMsg(e instanceof Error ? e.message : String(e));
			setMsgType("error");
		} finally {
			setStatusLoading(false);
		}
	}, [post]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	// 3000ms auto-clear (baseline)
	useEffect(() => {
		if (!msg) return;
		const t = window.setTimeout(() => setMsg(""), 3000);
		return () => window.clearTimeout(t);
	}, [msg]);

	const toggle = async () => {
		setLoading(true);
		setMsg("");
		try {
			const data = await post({ action: "toggle", enable: !triggerEnabled });
			if (data.success) {
				setTriggerEnabled(!triggerEnabled);
				setMsg(triggerEnabled ? "已关闭预约" : "已开启预约");
				setMsgType("success");
			} else {
				setMsg(data.error || "操作失败");
				setMsgType("error");
			}
		} catch (e) {
			setMsg(e instanceof Error ? e.message : String(e));
			setMsgType("error");
		} finally {
			setLoading(false);
		}
	};

	const updateSeat = async () => {
		const seat = seatInput.trim();
		if (!seat) return;
		setLoading(true);
		setMsg("");
		try {
			const data = await post({
				action: "set-seat",
				seat: String(Number(seat) + SEAT_OFFSET),
			});
			if (data.success) {
				setSeatInput(seatInput.trim());
				setMsg("座位已更新");
				setMsgType("success");
			} else {
				setMsg(data.error || "更新失败");
				setMsgType("error");
			}
		} catch (e) {
			setMsg(e instanceof Error ? e.message : String(e));
			setMsgType("error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="lib-wrapper">
			<div className="lib-card">
				<div className="lib-icon">📚</div>
				<h1 className="lib-title">图书馆预约控制台</h1>
				<p className="lib-desc">远程控制图书馆座位预约触发器（Aliyun FC）</p>

				<div className="lib-status-row">
					<span className="lib-status-label">触发器状态</span>
					{statusLoading ? (
						<span className="lib-status-value">加载中...</span>
					) : (
						<span className="lib-status-value">
							<span
								className={`toggle-dot${triggerEnabled ? " enabled" : ""}`}
							/>
							{triggerEnabled ? "已开启" : "已关闭"}
						</span>
					)}
				</div>

				<button
					className={`lib-toggle-btn${triggerEnabled ? " enabled" : " disabled"}`}
					disabled={loading || statusLoading}
					onClick={toggle}
				>
					{loading ? "操作中..." : triggerEnabled ? "关闭预约" : "开启预约"}
				</button>

				<div className="lib-input-row">
					<input
						className="lib-input"
						placeholder="座位号"
						value={seatInput}
						onChange={(e) => setSeatInput(e.target.value)}
						onKeyUp={(e) => {
							if (e.key === "Enter") updateSeat();
						}}
					/>
					<button
						className="lib-submit-btn"
						disabled={loading || !seatInput.trim()}
						onClick={updateSeat}
					>
						更新
					</button>
				</div>

				{msg && <div className={`lib-msg ${msgType}`}>{msg}</div>}
			</div>
		</div>
	);
}
