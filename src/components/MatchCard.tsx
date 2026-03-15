"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { expiryLabel, expiryColor } from "@/lib/utils";

interface MatchCardProps {
  matchId: string;
  currentOrgName: string;
  haveOrg: string;
  haveItem: string;
  haveQuantity: number;
  havePhone: string;
  haveExpiry?: string | null;
  haveCondition?: string;
  haveImageUrl?: string;
  needOrg: string;
  needItem: string;
  needQuantity: number;
  needPhone: string;
  needUrgency: string;
  status: string;
  onRequest: (matchId: string) => void;
  onResolve: (matchId: string) => void;
  onDismiss: (matchId: string) => void;
}

export function MatchCard({
  matchId,
  currentOrgName,
  haveOrg,
  haveItem,
  haveQuantity,
  havePhone,
  haveExpiry,
  haveCondition,
  haveImageUrl,
  needOrg,
  needItem,
  needQuantity,
  needPhone,
  needUrgency,
  status,
  onRequest,
  onResolve,
  onDismiss,
}: MatchCardProps) {
  const [showFullImage, setShowFullImage] = useState(false);

  if (status === "resolved" || status === "dismissed") return null;

  const isNeedSide = currentOrgName === needOrg;
  const isHaveSide = currentOrgName === haveOrg;
  const transferQty = Math.min(haveQuantity, needQuantity);
  const surplusAfter = haveQuantity - transferQty;
  const remainingNeed = needQuantity - transferQty;

  // Contact info for the other side
  const otherOrgName = isNeedSide ? haveOrg : needOrg;
  const otherPhone = isNeedSide ? havePhone : needPhone;

  // Card border color based on status
  const borderColor = status === "requested"
    ? "border-amber-300 bg-amber-50"
    : "border-hope-blue/20 bg-hope-blue-light";

  const headerColor = status === "requested"
    ? "bg-amber-500"
    : "bg-hope-blue";

  const headerText = status === "requested"
    ? isHaveSide
      ? "Transfer Requested"
      : "Request Sent"
    : "Match Found";

  return (
    <div className={cn("rounded-lg p-4 border", borderColor)}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", headerColor)}>
          <span className="text-white text-xs font-bold">
            {status === "requested" ? "R" : "M"}
          </span>
        </div>
        <span className={cn(
          "font-semibold text-sm",
          status === "requested" ? "text-amber-900" : "text-hope-blue-dark"
        )}>
          {headerText}
        </span>
        {haveExpiry && (
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium ml-auto",
              expiryColor(haveExpiry)
            )}
          >
            {expiryLabel(haveExpiry)}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm mb-3">
        <div className="bg-white rounded p-2">
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">
              {isHaveSide ? "You have" : haveOrg + " has"}
            </span>{" "}
            <span className="font-medium">{haveItem}</span> ({haveQuantity})
          </p>
          {haveCondition && (
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 mr-1">
              {haveCondition}
            </span>
          )}
          {isNeedSide && havePhone && (
            <p className="text-gray-500 text-xs mt-1">Contact: {havePhone}</p>
          )}
          {haveImageUrl && (
            <button
              type="button"
              onClick={() => setShowFullImage(true)}
              className="mt-2 block"
            >
              <img
                src={haveImageUrl}
                alt="Item photo"
                className="w-20 h-20 object-cover rounded-lg border hover:opacity-80 transition-opacity"
              />
            </button>
          )}
        </div>
        <div className="flex justify-center">
          <span className={cn(
            "text-lg",
            status === "requested" ? "text-amber-400" : "text-hope-blue"
          )}>↓</span>
        </div>
        <div className="bg-white rounded p-2">
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">
              {isNeedSide ? "You need" : needOrg + " needs"}
            </span>{" "}
            <span className="font-medium">{needItem}</span> ({needQuantity})
          </p>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              needUrgency === "critical"
                ? "bg-red-100 text-red-800"
                : needUrgency === "moderate"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
            )}
          >
            {needUrgency}
          </span>
          {isHaveSide && needPhone && (
            <p className="text-gray-500 text-xs mt-1">Contact: {needPhone}</p>
          )}
        </div>
      </div>

      {/* Transfer preview */}
      <div className={cn(
        "rounded p-2 mb-3 text-xs",
        status === "requested" ? "bg-amber-100 text-amber-800" : "bg-hope-blue-light text-hope-blue-dark"
      )}>
        <p>
          <strong>Transfer:</strong> {transferQty} items
          {surplusAfter > 0 && (
            <span> &middot; {surplusAfter} remain at {haveOrg}</span>
          )}
          {remainingNeed > 0 && (
            <span> &middot; {remainingNeed} still needed</span>
          )}
          {remainingNeed === 0 && surplusAfter === 0 && (
            <span> &middot; fully fulfills both sides</span>
          )}
          {remainingNeed === 0 && surplusAfter > 0 && (
            <span> &middot; need fully met</span>
          )}
        </p>
      </div>

      {/* Contact prompt — visible when requested */}
      {status === "requested" && (
        <div className="bg-white rounded p-2 mb-3 text-xs text-gray-600 border border-dashed border-gray-300">
          <p className="font-medium text-gray-800 mb-1">Coordinate directly:</p>
          <p>{otherOrgName} — {otherPhone || "no phone listed"}</p>
        </div>
      )}

      {/* Action buttons — depend on which side you're on and current status */}
      <div className="flex gap-2">
        {/* NEED side, pending → Request Transfer */}
        {isNeedSide && status === "pending" && (
          <>
            <button
              onClick={() => onRequest(matchId)}
              className="flex-1 bg-hope-blue text-white rounded-md py-2 px-3 text-sm font-medium hover:bg-hope-blue-dark transition-colors touch-target"
            >
              Request Transfer ({transferQty})
            </button>
            <button
              onClick={() => onDismiss(matchId)}
              className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 px-3 text-sm font-medium hover:bg-gray-300 transition-colors touch-target"
            >
              Dismiss
            </button>
          </>
        )}

        {/* NEED side, requested → waiting */}
        {isNeedSide && status === "requested" && (
          <div className="flex-1 text-center py-2 text-sm text-amber-700 font-medium">
            Waiting for {haveOrg} to confirm
          </div>
        )}

        {/* HAVE side, pending → informational */}
        {isHaveSide && status === "pending" && (
          <>
            <div className="flex-1 text-center py-2 text-sm text-gray-500">
              Waiting for {needOrg} to request
            </div>
            <button
              onClick={() => onDismiss(matchId)}
              className="bg-gray-200 text-gray-700 rounded-md py-2 px-3 text-sm font-medium hover:bg-gray-300 transition-colors touch-target"
            >
              Dismiss
            </button>
          </>
        )}

        {/* HAVE side, requested → Confirm or Decline */}
        {isHaveSide && status === "requested" && (
          <>
            <button
              onClick={() => onResolve(matchId)}
              className="flex-1 bg-green-600 text-white rounded-md py-2 px-3 text-sm font-medium hover:bg-green-700 transition-colors touch-target"
            >
              Confirm Transfer ({transferQty})
            </button>
            <button
              onClick={() => onDismiss(matchId)}
              className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 px-3 text-sm font-medium hover:bg-gray-300 transition-colors touch-target"
            >
              Decline
            </button>
          </>
        )}
      </div>

      {/* Image lightbox */}
      {showFullImage && haveImageUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={haveImageUrl}
            alt="Item photo"
            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
